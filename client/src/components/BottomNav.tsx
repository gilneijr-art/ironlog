import { Home, Dumbbell, Library, User } from "lucide-react";
import { useLocation, Link } from "wouter";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Início" },
    { path: "/routines", icon: Library, label: "Rotinas" },
    { path: "/exercises", icon: Dumbbell, label: "Exercícios" },
    { path: "/profile", icon: User, label: "Perfil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <a className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors">
                <Icon 
                  className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`text-xs ${isActive ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
