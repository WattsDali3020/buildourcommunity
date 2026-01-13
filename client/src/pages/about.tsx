import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Target, Shield, Mail, MapPin, Heart } from "lucide-react";
import { SiX } from "react-icons/si";

const values = [
  {
    icon: Users,
    title: "Community First",
    description: "Every decision we make centers on empowering local communities to own and shape their neighborhoods.",
  },
  {
    icon: Shield,
    title: "Transparency",
    description: "Blockchain technology ensures every transaction, vote, and dividend is publicly verifiable and immutable.",
  },
  {
    icon: Target,
    title: "Impact Driven",
    description: "We measure success not just in returns, but in jobs created, housing provided, and communities strengthened.",
  },
  {
    icon: Building2,
    title: "Sustainable Growth",
    description: "Long-term thinking guides our approach to property selection, development, and community partnerships.",
  },
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="py-16 lg:py-24 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-semibold mb-6">
                Democratizing Real Estate Investment
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                RevitaHub is building the infrastructure for community-owned revitalization. 
                We believe everyone deserves the opportunity to invest in and benefit from 
                the transformation of their neighborhoods.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-3xl font-semibold text-center mb-12">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <Card key={value.title}>
                  <CardContent className="p-6 text-center">
                    <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="team" className="py-16 lg:py-24 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-semibold mb-4">Built with Purpose</h2>
              <p className="text-lg text-muted-foreground mb-8">
                RevitaHub is a <strong className="text-foreground">Build Our Community, LLC</strong> project, 
                created to give everyday people a stake in transforming their neighborhoods.
              </p>
              <Card className="border-glow">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Heart className="h-6 w-6 text-primary" />
                    <span className="text-xl font-semibold">Our Mission</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    We believe that community wealth-building shouldn't be limited to those who can 
                    afford traditional real estate investments. By lowering the barrier to $12.50, 
                    we're making property ownership accessible to the ~231,000 adults in Cherokee County 
                    and similar communities across America.
                  </p>
                  <Button variant="outline" asChild>
                    <a href="https://x.com/RevitaHub" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <SiX className="h-4 w-4" />
                      Follow Our Journey
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="contact" className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-semibold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground mb-8">
                Have questions about our platform or interested in partnering? We'd love to hear from you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="flex items-center gap-2" data-testid="button-contact-email">
                  <Mail className="h-5 w-5" />
                  hello@revitahub.com
                </Button>
                <Button variant="outline" size="lg" className="flex items-center gap-2" data-testid="button-contact-location">
                  <MapPin className="h-5 w-5" />
                  Atlanta, Georgia
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
