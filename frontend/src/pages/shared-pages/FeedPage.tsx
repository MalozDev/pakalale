import ShopNav from "../../components/ShopNav";
import Feed from "../../components/Feed";

function FeedPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <ShopNav />
      <div className="p-4">
        <Feed />
      </div>
    </div>
  );
}

export default FeedPage;

