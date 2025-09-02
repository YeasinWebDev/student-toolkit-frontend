import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import axios from "axios";
import { LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import logo from "../assets/images/logo.png";

const data = {
  navMain: [
    {
      items: [
        {
          title: "Schedule Tracker",
          url: "/schedule",
        },
        {
          title: "Budget Tracker",
          url: "/budget",
        },
        {
          title: "Question Generator",
          url: "/question",
        }
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<any>();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, { withCredentials: true });
        if (response.data.data.user) {
          setUser(response.data.data.user);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchUser();
  }, []);

  const handleDelete = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
      navigate("/signin");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2 border-b">
          <img src={logo} alt="logo" className="w-12" />
          <h4 className="font-semibold">EduMate</h4>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((item, index) => (
          <SidebarGroup key={index}>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => {
                  const isActive = currentPath === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.url}>{item.title}</Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 p-2 border rounded-md overflow-hidden">
          <h4 className="uppercase bg-primary w-10 h-10 flex items-center justify-center font-semibold p-2 rounded-full text-black">{user?.name.slice(0, 2)}</h4>
          <div>
            <p className="font-semibold capitalize">{user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
          <div className="p-2 border rounded-full cursor-pointer" onClick={handleDelete}>
            <LogOut className="text-gray-500" size={20} />
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
