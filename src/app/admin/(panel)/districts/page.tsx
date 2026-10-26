"use client";
import { Loading, useToast } from "@/components/staff/kit";
import { PageTitle } from "@/components/staff/StaffShell";
import { db } from "@/lib/data";
import { useAsync } from "@/lib/hooks";
import type { District } from "@/lib/types";

export default function DistrictsPage() {
  const { data, loading, reload } = useAsync(async () => {
    const [d, ops] = await Promise.all([db.listDistricts(), db.listOperators()]);
    return { d, ops };
  });
  const { toast, toastNode } = useToast();
  if (loading || !data) return <Loading />;
  const upd = async (d: District, patch: Partial<District>) => { await db.saveDistrict({ ...d, ...patch }); toast("Saved"); reload(); };

  return (
    <>
      {toastNode}
      <PageTitle title="Districts & Service Areas" sub="Approved marketplace geography — Tamil Nadu" />
      <p className="mb-4 rounded-xl bg-blue-50 p-3 text-sm">District SEO pages are statically generated. After approving a new district page, add its intro content and redeploy (or move content to Firestore in the Firebase phase). Approve only districts with enough real supply.</p>
      <div className="card overflow-x-auto">
        <table className="tbl min-w-[700px]">
          <thead><tr><th>District</th><th>Based operators</th><th>Serving operators</th><th>Approved SEO page</th><th>Homepage popular</th></tr></thead>
          <tbody>
            {data.d.map((d) => (
              <tr key={d.id}>
                <td className="font-medium">{d.name}</td>
                <td className="tabular-nums">{data.ops.filter((o) => o.primaryDistrict === d.id && o.status === "active").length}</td>
                <td className="tabular-nums">{data.ops.filter((o) => o.serviceAreas.includes(d.id) && o.status === "active").length}</td>
                <td><input type="checkbox" aria-label={`Approve ${d.name} page`} className="h-4 w-4" checked={d.approvedPage} onChange={(e) => upd(d, { approvedPage: e.target.checked })} /></td>
                <td><input type="checkbox" aria-label={`${d.name} popular`} className="h-4 w-4" checked={d.popular} onChange={(e) => upd(d, { popular: e.target.checked })} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
