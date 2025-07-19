import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Key, CreditCard, Banknote, Wallet, Webhook, ArrowRight } from "lucide-react";

export function HomePage() {
  const features = [
    {
      title: "Geração de Token",
      description: "Gere tokens de acesso para as APIs do Itaú usando client credentials ou JWT",
      icon: Key,
      href: "/token",
      color: "text-blue-600",
    },
    {
      title: "PIX",
      description: "Crie pagamentos PIX, gere QR codes para recebimento e consulte status",
      icon: CreditCard,
      href: "/pix",
      color: "text-green-600",
    },
    {
      title: "Boletos",
      description: "Emita boletos bancários e consulte status de pagamento",
      icon: Banknote,
      href: "/boleto",
      color: "text-purple-600",
    },
    {
      title: "Conta",
      description: "Consulte saldo e extrato da conta bancária",
      icon: Wallet,
      href: "/account",
      color: "text-orange-600",
    },
    {
      title: "Webhooks",
      description: "Receba e gerencie notificações em tempo real do Itaú",
      icon: Webhook,
      href: "/webhook",
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Sistema de Token Itaú
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Plataforma completa para integração com as APIs do Banco Itaú. 
          Gerencie tokens, processe pagamentos PIX, emita boletos e muito mais.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <Icon className={`h-8 w-8 ${feature.color}`} />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to={feature.href} className="flex items-center justify-center space-x-2">
                    <span>Acessar</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
        <CardHeader>
          <CardTitle className="text-2xl text-orange-800">
            Sobre o Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-orange-700">
          <p>
            Este sistema foi desenvolvido para facilitar a integração com as APIs do Banco Itaú,
            seguindo todas as diretrizes de segurança e autenticação exigidas pelo banco.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Recursos Principais:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Autenticação OAuth 2.0 com mTLS</li>
                <li>• Suporte a JWT para maior segurança</li>
                <li>• Renovação automática de tokens</li>
                <li>• Interface intuitiva e responsiva</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">APIs Suportadas:</h3>
              <ul className="space-y-1 text-sm">
                <li>• PIX Pagamentos e Recebimentos</li>
                <li>• Emissão de Boletos</li>
                <li>• Consulta de Saldo e Extrato</li>
                <li>• Notificações Webhook</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
