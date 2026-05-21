import Card from "../components/Card";

export default function DashboardPage({ resumes, analyses }) {
  const avg = analyses.length ? Math.round(analyses.reduce((a, b) => a + b.score, 0) / analyses.length) : 0;

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <Card><p className="opacity-70 text-sm">Saved Resumes</p><h3 className="text-3xl font-bold">{resumes.length}</h3></Card>
        <Card><p className="opacity-70 text-sm">Avg ATS Score</p><h3 className="text-3xl font-bold">{avg}</h3></Card>
        <Card><p className="opacity-70 text-sm">Improvements</p><h3 className="text-3xl font-bold">{analyses.length}</h3></Card>
      </div>
      <Card>
        <h3 className="font-semibold mb-3">Recent Resumes</h3>
        {resumes.map((r) => (
          <div key={r._id} className="py-2 border-b border-white/10">
            {r.title} - Score {r.atsScore || 0}
          </div>
        ))}
      </Card>
    </div>
  );
}
