import Card from "../components/Card";

export default function ProfilePage({ user }) {
  return (
    <Card>
      <h2 className="font-semibold">Profile</h2>
      <p className="opacity-70">{user?.name}</p>
      <p className="opacity-70 text-sm">{user?.email}</p>
    </Card>
  );
}
