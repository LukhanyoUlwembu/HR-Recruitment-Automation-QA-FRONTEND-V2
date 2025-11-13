import { CircleUserRound } from 'lucide-react';
import { Bell } from 'lucide-react';
import logo from "../../assets/logo.svg";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Navbar = () => {

  const navigate = useNavigate();
  
  const handleSignOut = () => {
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("userId");
    navigate("/");
  };
  return (
    <nav className="sticky top-0 z-50 py-3 backdrop-blur-lg border-b border-neutral-200/80">
      <div className="container px-4 mx-auto relative text-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center flex-shrink-0">
            <img className="h-10 w-30 mr-2" src={logo} alt="logo" />
            </div>
          <div className="flex flex-row space-x-2">
            <div className="relative group w-fit">
              <button
              onClick={handleSignOut}
              className="border-3 border-blue-500 text-blue-500 py-2 px-4 rounded-md font-bold" >
                Sign Out
              </button>
              </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;