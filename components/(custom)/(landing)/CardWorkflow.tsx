"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CalendarIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { WorkflowCardTypes } from "@/utils/types";

export default function CardWorkflow({ workflows }: {workflows: WorkflowCardTypes}) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Format date to readable string
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Get author's initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };
  
  // Extract first name and truncate content
  const truncatedContent = workflows?.content?.length > 120 
    ? `${workflows.content.substring(0, 120)}...` 
    : workflows?.content;
  
  const workflowUrl = `/workflow/${workflows?.slug}`;
  
  return (
    <Card 
      className="max-w-md overflow-hidden transition-all duration-300 hover:shadow-lg border-primary/10 pt-0 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={workflowUrl}>
        <div className="relative overflow-hidden h-60">
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
            style={{ 
              backgroundImage: `url(${workflows?.workflowImage})`,
            }}
          />
          {/* Improved gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Category badge with improved positioning */}
          <div className="absolute bottom-4 left-4">
            <Badge 
              variant="secondary" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-3 py-1 shadow-md transition-all duration-300 group-hover:translate-y-[-2px]"
            >
              {workflows?.category}
            </Badge>
          </div>
          
          {/* View count badge - Added */}
          <div className="absolute top-4 right-4">
            <Badge 
              variant="outline" 
              className="bg-black/50 text-white border-transparent backdrop-blur-sm"
            >
              <Eye className="h-3 w-3 mr-1" />
              {workflows.viewCount || 0}
            </Badge>
          </div>
        </div>
      </Link>
      
      <CardHeader className="pb-2 pt-4">
        <Link href={workflowUrl}>
          <CardTitle className="text-xl font-bold line-clamp-2 text-foreground hover:text-primary transition-colors group-hover:text-primary">
            {workflows?.title.replace(/^"(.+)"$/, '$1')}
          </CardTitle>
        </Link>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <CardDescription className="text-sm text-muted-foreground/90 line-clamp-3">
          {truncatedContent}
        </CardDescription>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8 border border-primary/10">
              <AvatarImage src={workflows?.author?.profileImage} alt={`${workflows?.author?.firstName} ${workflows?.author?.lastName}`} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(workflows?.author?.firstName, workflows?.author?.lastName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-foreground">{workflows?.author?.firstName} {workflows?.author?.lastName}</span>
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarIcon className="mr-1 h-3 w-3" />
            <span>{formatDate(workflows?.author?.createdAt)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 pb-4">
        <div className="w-full flex justify-end items-center">
          <Link href={workflowUrl} className="flex items-center">
            <Button 
              variant='outline' 
              size="sm" 
              className="text-primary hover:text-white hover:bg-primary h-auto px-3 py-1.5 rounded-full transition-all duration-300 group-hover:bg-primary/90 border-primary/20 group-hover:border-primary"
            >
              View workflow <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}