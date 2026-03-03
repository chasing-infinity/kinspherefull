import { db } from "@/lib/db";
import Decimal from "decimal.js";

export async function generateMonthlyPayslips(month: number, year: number) {
  const configs = await db.payrollConfig.findMany({
    where: { employee: { status: "ACTIVE", deletedAt: null } },
  });
  let generated = 0, skipped = 0;
  for (const config of configs) {
    const exists = await db.payslip.findUnique({
      where: { employeeId_month_year: { employeeId: config.employeeId, month, year } },
    });
    if (exists) { skipped++; continue; }
    const monthly = new Decimal(config.annualCTC.toString()).div(12);
    const basic   = monthly.mul(config.basicPercent.toString()).div(100).toDecimalPlaces(2);
    const hra     = monthly.mul(config.hraPercent.toString()).div(100).toDecimalPlaces(2);
    const other   = monthly.minus(basic).minus(hra).toDecimalPlaces(2);
    const gross   = basic.plus(hra).plus(other);
    const pf      = new Decimal(config.pfDeduction.toString());
    const pt      = new Decimal(config.professionalTax.toString());
    const tds     = new Decimal(config.incomeTax.toString());
    const totalDed = pf.plus(pt).plus(tds);
    await db.payslip.create({
      data: {
        employeeId: config.employeeId, month, year,
        basicSalary: basic.toNumber(), hra: hra.toNumber(),
        otherAllowances: other.toNumber(), grossSalary: gross.toNumber(),
        pfDeduction: pf.toNumber(), professionalTax: pt.toNumber(),
        incomeTax: tds.toNumber(), totalDeductions: totalDed.toNumber(),
        netSalary: gross.minus(totalDed).toNumber(),
      },
    });
    generated++;
  }
  return { generated, skipped };
}
