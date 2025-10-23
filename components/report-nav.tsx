"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, FileText, BookOpen, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
}

interface ReportNavProps {
  slug: string;
  projects: Project[];
  reportTitle: string;
}

export function ReportNav({ slug, projects, reportTitle }: ReportNavProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">
          {reportTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Introduction */}
        <Link href={`/reports/${slug}`}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              isActive(`/reports/${slug}`) && "bg-muted"
            )}
            size="sm"
          >
            <Home className="h-4 w-4" />
            Introducción
          </Button>
        </Link>

        {/* Project Reports */}
        <div className="pt-2">
          <div className="text-xs font-semibold text-muted-foreground px-3 py-2">
            Proyectos
          </div>
          {projects.map((project) => (
            <Link key={project.id} href={`/reports/${slug}/${project.id}`}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2 pl-6",
                  isActive(`/reports/${slug}/${project.id}`) && "bg-muted"
                )}
                size="sm"
              >
                <ChevronRight className="h-3 w-3" />
                <span className="truncate">{project.name}</span>
              </Button>
            </Link>
          ))}
        </div>

        {/* Methodology */}
        <div className="pt-2">
          <Link href={`/reports/${slug}/methodology`}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                isActive(`/reports/${slug}/methodology`) && "bg-muted"
              )}
              size="sm"
            >
              <BookOpen className="h-4 w-4" />
              Metodología
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

