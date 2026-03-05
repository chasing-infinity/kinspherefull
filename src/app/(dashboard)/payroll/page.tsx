"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

function PayslipModal({ slip, onClose }: any) {
  const [detail, setDetail] = useState<any>(null);
  useEffect(() => {
    fetch(`/api/payroll/payslips/${slip.id}`)
      .then(r => r.json())
      .then(setDetail)
      .catch(console.error);
  }, [slip.id]);

  if (!detail) return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100 }}>
      <div style={{ background:"#fff", borderRadius:16, padding:32, color:"#9CA3AF" }}>Loading…</div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:24 }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:18, width:520, maxHeight:"90vh", overflow:"auto", boxShadow:"0 24px 60px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
        <div style={{ background:"#4F6EF7", borderRadius:"18px 18px 0 0", padding:"24px 28px", color:"#fff" }}>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:11, opacity:0.7, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:4 }}>Payslip</div>
              <div style={{ fontSize:22, fontWeight:800 }}>{MONTHS[detail.month]} {detail.year}</div>
              <div style={{ fontSize:13, opacity:0.8, marginTop:2 }}>{detail.employee?.firstName} {detail.employee?.lastName} · {detail.employee?.employeeCode}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:11, opacity:0.7, marginBottom:4 }}>Net Pay</div>
              <div style={{ fontSize:28, fontWeight:800 }}>{fmt(Number(detail.netSalary))}</div>
            </div>
          </div>
        </div>
        <div style={{ padding:"24px 28px" }}>
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Earnings</div>
            {[["Basic Salary", detail.basicSalary],["HRA", detail.hra],["Other Allowances", detail.otherAllowances]].map(([l,v]) => (
              <div key={String(l)} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #F9FAFB" }}>
                <span style={{ fontSize:13, color:"#4B5563" }}>{l}</span>
                <span style={{ fontSize:13, fontWeight:600, color:"#1F2937" }}>{fmt(Number(v))}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0" }}>
              <span style={{ fontSize:13, fontWeight:700, color:"#1F2937" }}>Gross Salary</span>
              <span style={{ fontSize:14, fontWeight:800, color:"#22C55E" }}>{fmt(Number(detail.grossSalary))}</span>
            </div>
          </div>
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Deductions</div>
            {[["Provident Fund (PF)", detail.pfDeduction],["Professional Tax", detail.professionalTax],["Income Tax (TDS)", detail.incomeTax]].map(([l,v]) => (
              <div key={String(l)} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #F9FAFB" }}>
                <span style={{ fontSize:13, color:"#4B5563" }}>{l}</span>
                <span style={{ fontSize:13, fontWeight:600, color:"#EF4444" }}>{Number(v) > 0 ? `- ${fmt(Number(v))}` : "—"}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"10px 0" }}>
              <span style={{ fontSize:13, fontWeight:700, color:"#1F2937" }}>Total Deductions</span>
              <span style={{ fontSize:14, fontWeight:800, color:"#EF4444" }}>- {fmt(Number(detail.totalDeductions))}</span>
            </div>
          </div>
          <div style={{ background:"#F9FAFB", borderRadius:12, padding:"16px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:11, color:"#9CA3AF", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.07em" }}>Net Pay</div>
            <div style={{ fontSize:26, fontWeight:800, color:"#4F6EF7" }}>{fmt(Number(detail.netSalary))}</div>
          </div>
        </div>
        <div style={{ padding:"0 28px 24px", display:"flex", gap:10 }}>
          <button onClick={() => window.print()} style={{ flex:1, background:"#4F6EF7", color:"#fff", border:"none", borderRadius:10, padding:10, fontSize:13, fontWeight:600, cursor:"pointer" }}>↓ Print / Save PDF</button>
          <button onClick={onClose} style={{ padding:"10px 16px", background:"#F3F4F6", color:"#374151", border:"none", borderRadius:10, fontSize:13, cursor:"pointer" }}>Close</button>
        </div>
      </div>
    </div>
  );
}

function ConfigModal({ emp, onDone, onClose }: any) {
  const [annualCTC, setAnnualCTC] = useState(String(emp.payrollConfig?.annualCTC || ""));
  const [basicPercent, setBasicPercent] = useState(String(emp.payrollConfig?.basicPercent || 40));
  const [hraPercent, setHraPercent] = useState(String(emp.payrollConfig?.hraPercent || 20));
  const [pfDeduction, setPfDeduction] = useState(String(emp.payrollConfig?.pfDeduction || 1800));
  const [professionalTax, setProfessionalTax] = useState(String(emp.payrollConfig?.professionalTax || 200));
  const [incomeTax, setIncomeTax] = useState(String(emp.payrollConfig?.incomeTax || 0));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const monthly = Number(annualCTC) / 12;
  const basic = Math.round(monthly * Number(basicPercent) / 100);
  const hra = Math.round(monthly * Number(hraPercent) / 100);
  const net = Math.round(monthly - Number(pfDeduction) - Number(professionalTax) - Number(incomeTax));
  const valid = Number(basicPercent) + Number(hraPercent) <= 100 && Number(basicPercent) > 0 && Number(annualCTC) > 0;

  const save = async () => {
    setSaving(true); setError("");
    const res = await fetch("/api/payroll/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: emp.id, annualCTC: Number(annualCTC), basicPercent: Number(basicPercent), hraPercent: Number(hraPercent), pfDeduction: Number(pfDeduction), professionalTax: Number(professionalTax), incomeTax: Number(incomeTax) }),
    });
    if (res.ok) { onDone(); onClose(); }
    else { const d = await res.json(); setError(d.error || "Failed to save"); }
    setSaving(false);
  };

  const iStyle = { width:"100%", padding:"9px 12px", border:"1px solid #E5E7EB", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box" as const };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, padding:24 }} onClick={onClose}>
      <div style={{ background:"#fff", borderRadius:18, width:480, boxShadow:"0 20px 50px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
        <div style={{ padding:"22px 28px", borderBottom:"1px solid #F3F4F6" }}>
          <div style={{ fontSize:16, fontWeight:700, color:"#111827" }}>Configure Payroll</div>
          <div style={{ fontSize:12, color:"#9CA3AF", marginTop:2 }}>{emp.firstName} {emp.lastName} · {emp.employeeCode}</div>
        </div>
        <div style={{ padding:"20px 28px" }}>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>Annual CTC (₹)</label>
            <input type="number" value={annualCTC} onChange={e => setAnnualCTC(e.target.value)} placeholder="e.g. 1200000" style={iStyle} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:10 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>Basic %</label>
              <input type="number" min="1" max="80" value={basicPercent} onChange={e => setBasicPercent(e.target.value)} style={iStyle} />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"#374151", display:"block", marginBottom:5 }}>HRA %</label>
              <input type="number" min="0" max="50" value={hraPercent} onChange={e => setHraPercent(e.target.value)} style={iStyle} />
            </div>
          </div>
          {Number(annualCTC) > 0 && (
            <div style={{ background:"#F9FAFB", borderRadius:10, padding:"12px 14px", marginBottom:14, fontSize:12 }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                {[{l:"Basic",v:basic,c:"#4F6EF7"},{l:"HRA",v:hra,c:"#8B5CF6"},{l:"Other",v:Math.round(monthly-basic-hra),c:"#F97316"}].map(r => (
                  <div key={r.l} style={{ textAlign:"center" }}>
                    <div style={{ fontWeight:700, color:r.c }}>{fmt(r.v)}</div>
                    <div style={{ color:"#9CA3AF" }}>{r.l}/mo</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ fontSize:12, fontWeight:600, color:"#374151", marginBottom:8 }}>Monthly Deductions (₹)</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
            <div><label style={{ fontSize:11, color:"#6B7280", display:"block", marginBottom:4 }}>PF</label><input type="number" min="0" value={pfDeduction} onChange={e => setPfDeduction(e.target.value)} style={iStyle} /></div>
            <div><label style={{ fontSize:11, color:"#6B7280", display:"block", marginBottom:4 }}>Prof Tax</label><input type="number" min="0" value={professionalTax} onChange={e => setProfessionalTax(e.target.value)} style={iStyle} /></div>
            <div><label style={{ fontSize:11, color:"#6B7280", display:"block", marginBottom:4 }}>TDS</label><input type="number" min="0" value={incomeTax} onChange={e => setIncomeTax(e.target.value)} style={iStyle} /></div>
          </div>
          {Number(annualCTC) > 0 && (
            <div style={{ background:"#EEF1FE", borderRadius:10, padding:"10px 14px", display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:12, color:"#3451D1", fontWeight:600 }}>Net Monthly Pay</span>
              <span style={{ fontSize:18, fontWeight:800, color:"#4F6EF7" }}>{fmt(net)}</span>
            </div>
          )}
          {error && <div style={{ background:"#FEE2E2", color:"#B91C1C", borderRadius:8, padding:"9px 12px", fontSize:13, marginTop:12 }}>{error}</div>}
        </div>
        <div style={{ padding:"0 28px 20px", display:"flex", gap:10 }}>
          <button disabled={!valid || saving} onClick={save} style={{ flex:1, background: valid&&!saving?"#4F6EF7":"#9CA3AF", color:"#fff", border:"none", borderRadius:10, padding:10, fontSize:13, fontWeight:600, cursor: valid&&!saving?"pointer":"not-allowed" }}>
            {saving ? "Saving…" : "Save Configuration"}
          </button>
          <button onClick={onClose} style={{ padding:"10px 16px", background:"#F3F4F6", color:"#374151", border:"none", borderRadius:10, fontSize:13, cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default function PayrollPage() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";
  const [tab, setTab] = useState("payslips");
  const [payslips, setPayslips] = useState<any[]>([]);
  const [configData, setConfigData] = useState<any>(null);
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [configEmp, setConfigEmp] = useState<any>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  const loadPayslips = () => {
    setLoading(true);
    fetch(`/api/payroll/payslips?year=${year}`)
      .then(r => r.json())
      .then(d => setPayslips(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const loadConfig = () => {
    fetch("/api/payroll/config")
      .then(r => r.json())
      .then(setConfigData)
      .catch(console.error);
  };

  useEffect(() => {
    if (status === "loading") return;
    loadPayslips();
  }, [year, status]);

  useEffect(() => {
    if (status === "loading") return;
    if (isAdmin && tab === "config") loadConfig();
  }, [tab, isAdmin, status]);

  if (status === "loading") return (
    <div style={{ color:"#9CA3AF", paddingTop:40, textAlign:"center" }}>Loading…</div>
  );

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:"#111827", margin:0 }}>Payroll</h1>
          <p style={{ fontSize:13, color:"#9CA3AF", marginTop:4 }}>{isAdmin ? "Manage salary configs · payslips auto-generate on the 15th" : "Your payslips — generated on the 15th each month"}</p>
        </div>
        <select value={year} onChange={e => setYear(Number(e.target.value))} style={{ padding:"7px 12px", border:"1px solid #E5E7EB", borderRadius:8, fontSize:13, color:"#374151", background:"#fff", outline:"none" }}>
          {[2026,2025,2024].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {isAdmin && (
        <div style={{ display:"flex", gap:4, marginBottom:20, background:"#F3F4F6", borderRadius:10, padding:4, width:"fit-content" }}>
          {[["payslips","All Payslips"],["config","Salary Configuration"]].map(([id,label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ padding:"6px 14px", borderRadius:7, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:tab===id?"#fff":"transparent", color:tab===id?"#1F2937":"#9CA3AF", boxShadow:tab===id?"0 1px 3px rgba(0,0,0,0.1)":"none" }}>{label}</button>
          ))}
        </div>
      )}

      {isAdmin && tab === "config" && configData && (
        <div style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:"#F9FAFB" }}>
              {["Employee","Annual CTC","Basic","HRA","Other","Net/Month",""].map(h => (
                <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {[...configData.configured.map((c: any) => ({ ...c.employee, payrollConfig: c })), ...configData.unconfigured].map((emp: any) => {
                const cfg = emp.payrollConfig;
                const net = cfg ? Math.round(Number(cfg.annualCTC)/12 - Number(cfg.pfDeduction) - Number(cfg.professionalTax) - Number(cfg.incomeTax)) : null;
                return (
                  <tr key={emp.id} style={{ borderTop:"1px solid #F9FAFB" }}>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:"50%", background:"#EEF1FE", color:"#4F6EF7", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{emp.firstName[0]}{emp.lastName[0]}</div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600, color:"#1F2937" }}>{emp.firstName} {emp.lastName}</div>
                          <div style={{ fontSize:11, color:"#9CA3AF" }}>{emp.department?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px", fontSize:13, fontWeight:600, color:"#374151" }}>{cfg ? fmt(Number(cfg.annualCTC)) : <span style={{ color:"#9CA3AF" }}>Not set</span>}</td>
                    <td style={{ padding:"12px 16px" }}>{cfg ? <span style={{ background:"#EEF1FE", color:"#3451D1", fontSize:12, fontWeight:600, padding:"2px 8px", borderRadius:6 }}>{cfg.basicPercent}%</span> : "—"}</td>
                    <td style={{ padding:"12px 16px" }}>{cfg ? <span style={{ background:"#F3E8FF", color:"#7C3AED", fontSize:12, fontWeight:600, padding:"2px 8px", borderRadius:6 }}>{cfg.hraPercent}%</span> : "—"}</td>
                    <td style={{ padding:"12px 16px" }}>{cfg ? <span style={{ background:"#FFF7ED", color:"#F97316", fontSize:12, fontWeight:600, padding:"2px 8px", borderRadius:6 }}>{100-cfg.basicPercent-cfg.hraPercent}%</span> : "—"}</td>
                    <td style={{ padding:"12px 16px", fontSize:13, fontWeight:700, color:"#22C55E" }}>{net ? fmt(net) : "—"}</td>
                    <td style={{ padding:"12px 16px" }}>
                      <button onClick={() => setConfigEmp(emp)} style={{ background:"#F3F4F6", color:"#374151", border:"none", borderRadius:7, padding:"5px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>{cfg ? "Edit" : "Set up"}</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === "payslips" && (
        <div style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
          {loading ? <div style={{ padding:40, textAlign:"center", color:"#9CA3AF" }}>Loading payslips…</div> : (
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead><tr style={{ background:"#F9FAFB" }}>
                {[isAdmin?"Employee":"", "Month","Gross","Deductions","Net Pay",""].filter(Boolean).map(h => (
                  <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:"#9CA3AF", textTransform:"uppercase", letterSpacing:"0.05em" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {payslips.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding:40, textAlign:"center", color:"#9CA3AF", fontSize:13 }}>
                    No payslips for {year} yet.<br/><span style={{ fontSize:12 }}>They are generated automatically on the 15th of each month.</span>
                  </td></tr>
                ) : payslips.map(slip => (
                  <tr key={slip.id} style={{ borderTop:"1px solid #F9FAFB", cursor:"pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background="#F9FAFB"}
                    onMouseLeave={e => e.currentTarget.style.background=""}
                    onClick={() => setSelectedSlip(slip)}>
                    {isAdmin && <td style={{ padding:"12px 16px" }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#1F2937" }}>{slip.employee?.firstName} {slip.employee?.lastName}</div>
                      <div style={{ fontSize:11, color:"#9CA3AF" }}>{slip.employee?.department?.name}</div>
                    </td>}
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#1F2937" }}>{MONTHS[slip.month]} {slip.year}</div>
                    </td>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"#4B5563" }}>{fmt(Number(slip.grossSalary))}</td>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"#EF4444" }}>- {fmt(Number(slip.totalDeductions))}</td>
                    <td style={{ padding:"12px 16px", fontSize:14, fontWeight:700, color:"#22C55E" }}>{fmt(Number(slip.netSalary))}</td>
                    <td style={{ padding:"12px 16px" }}>
                      <button style={{ background:"#EEF1FE", color:"#4F6EF7", border:"none", borderRadius:7, padding:"4px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>View →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {selectedSlip && <PayslipModal slip={selectedSlip} onClose={() => setSelectedSlip(null)} />}
      {configEmp && <ConfigModal emp={configEmp} onDone={() => { loadConfig(); loadPayslips(); }} onClose={() => setConfigEmp(null)} />}
    </div>
  );
}            
