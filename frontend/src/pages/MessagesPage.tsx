import { motion } from "framer-motion";
import ShopNav from "../components/ShopNav";
import { MessageSquare, Users } from "lucide-react";

const conversations = [
  { id: 1, customer: "John Doe", lastMessage: "Is the iPhone 15 Pro available?", time: "1h ago", unread: true },
  { id: 2, customer: "Jane Smith", lastMessage: "What are your business hours?", time: "3h ago", unread: false },
  { id: 3, customer: "Mike Johnson", lastMessage: "Do you offer delivery?", time: "5h ago", unread: true },
];

function MessagesPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <ShopNav />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-100 mb-6 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" /> Messages
        </h1>
        <div className="space-y-4">
          {conversations.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-slate-800 rounded-lg p-4 border border-slate-700 ${message.unread ? "border-primary-500/50 bg-primary-500/5" : ""}`}
            >
              <div className="flex items-start space-x-3">
                <div className="bg-primary-500 p-2 rounded-full">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-slate-100">{message.customer}</h4>
                    <span className="text-xs text-slate-500">{message.time}</span>
                  </div>
                  <p className="text-slate-300 mt-1">{message.lastMessage}</p>
                  <button className="mt-2 text-primary-500 hover:text-primary-400 text-sm font-medium transition-colors duration-200">
                    Reply
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MessagesPage;
