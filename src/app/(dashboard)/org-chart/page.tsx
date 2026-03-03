"use client";
import { useEffect, useState } from "react";

function OrgNode({ node, level = 0 }: { node: any; level?: number }) {
  const colors = ["#4F6EF7","#8B5CF6","#10B981","#F97316","#EF4444","#06B6D4"];
  const color = colors[level % colors.length];
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div style={{ background:"#fff", border: level===0 ? `2px solid ${color}` : "1px solid #E5E7EB", borderRadius:12, padding:"14px 18px", minWidth:140, textAlign:"center", boxShadow: level===0 ? `0 0 0 4px ${color}15` : "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ width:40, height:40, borderRadius:"50%", background:color+"18", color, fontSize:14, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px" }}>
          {node.firstName[0]}{node.lastName[0]}
        </div>
        <div style={{ fontSize:13, fontWeight:700, color:"#1F2937" }}>{node.firstName} {node.lastName}</div>
        <div style={{ fontSize:11, color:"#9CA3AF", marginTop:2 }}>{node.department?.name || ""}</div>
        <div style={{ marginTop:6 }}>
          <span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:20, background:color+"18", color }}>{node.user?.role?.replace("_"," ")}</span>
        </div>
      </div>

      {node.children?.length > 0 && (
        <>
          <div style={{ width:2, height:20, background:"#E5E7EB" }} />
          <div style={{ position:"relative", display:"flex", gap:16 }}>
            {node.children.length > 1 && (
              <div style={{ position:"absolute", top:0, left:"10%", right:"10%", height:2, background:"#E5E7EB" }} />
            )}
            {node.children.map((child: any) => (
              <div key={child.id} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                <div style={{ width:2, height:20, background:"#E5E7EB" }} />
                <OrgNode node={child} level={level+1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function OrgChartPage() {
  const [tree, setTree] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/org-chart").then(r=>r.json()).then(d => setTree(Array.isArray(d)?d:[])).finally(()=>setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:22, fontWeight:700, color:"#111827", margin:0 }}>Org Chart</h1>
        <p style={{ fontSize:13, color:"#9CA3AF", marginTop:4 }}>Bipolar Factory team structure</p>
      </div>
      <div style={{ background:"#fff", border:"1px solid #F3F4F6", borderRadius:14, padding:40, overflowX:"auto", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
        {loading ? (
          <div style={{ textAlign:"center", color:"#9CA3AF", padding:40 }}>Loading…</div>
        ) : (
          <div style={{ display:"flex", justifyContent:"center", gap:32 }}>
            {tree.map((root: any) => <OrgNode key={root.id} node={root} />)}
          </div>
        )}
      </div>
    </div>
  );
}
