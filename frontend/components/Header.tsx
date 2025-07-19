import { Link, useLocation } from "react-router-dom";
import { Building2, CreditCard, Banknote, Wallet, Webhook, Key } from "lucide-react";

export function Header() {
  const location = useLocation();

  const navigation = [
    { name: "Início", href: "/", icon: Building2 },
    { name: "Token", href: "/token", icon: Key },
    { name: "PIX", href: "/pix", icon: CreditCard },
    { name: "Boleto", href: "/boleto", icon: Banknote },
    { name: "Conta", href: "/account", icon: Wallet },
    { name: "Webhook", href: "/webhook", icon: Webhook },
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-orange-600" />
            <span className="text-xl font-bold text-gray-900">Sistema Token Bancário</span>
          </div>
          
          <nav className="flex space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-orange-100 text-orange-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
