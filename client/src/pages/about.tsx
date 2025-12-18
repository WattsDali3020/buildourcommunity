import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, Users, Target, Shield, Mail, MapPin } from "lucide-react";
import { SiLinkedin, SiX } from "react-icons/si";

// todo: remove mock functionality
const teamMembers = [
  { name: "Sarah Chen", role: "CEO & Co-Founder", initials: "SC" },
  { name: "Marcus Johnson", role: "CTO", initials: "MJ" },
  { name: "Emily Rodriguez", role: "Head of Legal", initials: "ER" },
  { name: "David Kim", role: "VP of Community", initials: "DK" },
];

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
            <h2 className="text-3xl font-semibold text-center mb-4">Leadership Team</h2>
            <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
              Experienced professionals from real estate, blockchain, legal, and community development
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member) => (
                <Card key={member.name}>
                  <CardContent className="p-6 text-center">
                    <Avatar className="h-20 w-20 mx-auto mb-4">
                      <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{member.role}</p>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <SiLinkedin className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <SiX className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
