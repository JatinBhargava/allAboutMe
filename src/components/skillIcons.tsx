import type { ComponentType } from 'react';
import {
  Boxes, Database, Drama, FileSearch, FlaskConical, GitPullRequest, Infinity as InfinityIcon,
  Kanban, Layers, MessageSquareCode, ScanSearch, Sparkles, Webhook,
} from 'lucide-react';
import { FaAws, FaJava } from 'react-icons/fa';
import { VscAzure } from 'react-icons/vsc';
import {
  SiApachekafka, SiApachemaven, SiCplusplus, SiDocker, SiFlyway, SiGit, SiGithubactions,
  SiGithubcopilot, SiGrafana, SiHelm, SiHibernate, SiJavascript, SiJenkins, SiJunit5, SiKubernetes,
  SiLinux, SiMysql, SiPostgresql, SiPostman, SiRedis, SiSpring, SiSpringboot, SiSpringsecurity,
  SiSwagger, SiTerraform, SiTypescript,
} from 'react-icons/si';

export interface SkillIcon {
  Icon: ComponentType<{ className?: string }>;
  /** Brand color (or a chosen accent for generic concept icons). */
  color: string;
}

const spring = '#6DB33F';

/** Maps each skill name in `resume.ts` to an icon. */
export const skillIcons: Record<string, SkillIcon> = {
  'Java 8 / 11 / 17 / 21': { Icon: FaJava, color: '#E76F00' },
  SQL: { Icon: Database, color: '#0284C7' },
  TypeScript: { Icon: SiTypescript, color: '#3178C6' },
  JavaScript: { Icon: SiJavascript, color: '#E5C100' },
  'C++': { Icon: SiCplusplus, color: '#00599C' },

  'Spring Boot': { Icon: SiSpringboot, color: spring },
  'Spring Data JPA': { Icon: SiSpring, color: spring },
  'Spring Security': { Icon: SiSpringsecurity, color: spring },
  Hibernate: { Icon: SiHibernate, color: '#59666C' },
  'REST APIs': { Icon: Webhook, color: '#DB2777' },
  Microservices: { Icon: Boxes, color: '#7C3AED' },
  'OpenAPI / Swagger': { Icon: SiSwagger, color: '#6BA539' },
  Concurrency: { Icon: Layers, color: '#0891B2' },
  'Apache Kafka': { Icon: SiApachekafka, color: '#231F20' },
  Redis: { Icon: SiRedis, color: '#DC382D' },
  PostgreSQL: { Icon: SiPostgresql, color: '#4169E1' },
  MySQL: { Icon: SiMysql, color: '#4479A1' },

  'Kubernetes (AKS)': { Icon: SiKubernetes, color: '#326CE5' },
  Docker: { Icon: SiDocker, color: '#2496ED' },
  Helm: { Icon: SiHelm, color: '#0F1689' },
  Terraform: { Icon: SiTerraform, color: '#844FBA' },
  'Azure (AKS, Event Hubs, Service Bus)': { Icon: VscAzure, color: '#0078D4' },
  'AWS (ECS Fargate, ALB, Route 53, CloudFront, CloudWatch, EC2, S3)': { Icon: FaAws, color: '#FF9900' },
  Jenkins: { Icon: SiJenkins, color: '#D24939' },
  'GitHub Actions': { Icon: SiGithubactions, color: '#2088FF' },
  'CI/CD': { Icon: InfinityIcon, color: '#16A34A' },
  Git: { Icon: SiGit, color: '#F05032' },
  Maven: { Icon: SiApachemaven, color: '#C71A36' },
  Flyway: { Icon: SiFlyway, color: '#CC0200' },
  Linux: { Icon: SiLinux, color: '#1A1A1A' },

  'JUnit 5': { Icon: SiJunit5, color: '#25A162' },
  Mockito: { Icon: Drama, color: '#65A30D' },
  'Integration Testing': { Icon: FlaskConical, color: '#9333EA' },
  Postman: { Icon: SiPostman, color: '#FF6C37' },
  Grafana: { Icon: SiGrafana, color: '#F46800' },
  'Code Review': { Icon: GitPullRequest, color: '#8250DF' },
  'Agile / Scrum': { Icon: Kanban, color: '#0D9488' },

  'GitHub Copilot': { Icon: SiGithubcopilot, color: '#1A1A1A' },
  'LLM Integration': { Icon: Sparkles, color: '#D97706' },
  'Prompt Engineering': { Icon: MessageSquareCode, color: '#2563EB' },
  RAG: { Icon: FileSearch, color: '#E11D48' },
  'Vector Search': { Icon: ScanSearch, color: '#4F46E5' },
};
