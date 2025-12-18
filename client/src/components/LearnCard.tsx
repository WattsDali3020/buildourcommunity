import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, type LucideIcon } from "lucide-react";
import { Link } from "wouter";

export interface LearnArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  icon: LucideIcon;
}

const difficultyColors = {
  beginner: "bg-chart-3 text-white",
  intermediate: "bg-chart-4 text-white",
  advanced: "bg-chart-5 text-white",
};

export function LearnCard({ article }: { article: LearnArticle }) {
  return (
    <Link href={`/learn/${article.id}`}>
      <Card className="h-full hover-elevate active-elevate-2 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <article.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className="text-xs">{article.category}</Badge>
                <Badge className={`text-xs ${difficultyColors[article.difficulty]}`}>
                  {article.difficulty.charAt(0).toUpperCase() + article.difficulty.slice(1)}
                </Badge>
              </div>
              <h3 className="font-semibold mb-2 line-clamp-2" data-testid={`text-article-title-${article.id}`}>
                {article.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {article.description}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{article.readTime} min read</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
