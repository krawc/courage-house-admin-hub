
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="text-center space-y-6 max-w-md mx-auto p-8">
        <h1 className="text-4xl font-bold text-gray-800">
          The Courage House
        </h1>
        <p className="text-lg text-gray-600">
          Welcome to our community platform
        </p>
        <div className="space-y-4">
          <Link to="/admin">
            <Button size="lg" className="w-full">
              Admin Panel
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
