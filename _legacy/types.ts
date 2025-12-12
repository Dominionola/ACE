import React from 'react';

export interface NavItem {
  label: string;
  href: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

// Placeholder for future AI types
export interface StudySession {
  id: string;
  topic: string;
  content: string;
}