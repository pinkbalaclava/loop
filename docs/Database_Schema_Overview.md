# Loop ISP Database Schema Overview

## Database Purpose
This database supports the Loop ISP WhatsApp onboarding system for rural South African internet customers. It tracks the complete customer journey from initial contact through package selection and service activation.

## Key Features
- **Multi-language support**: English, Afrikaans, and isiZulu
- **Geographic coverage tracking**: GPS and manual location support
- **Customer journey analytics**: Track progression through awareness, consideration, decision, retention, advocacy stages
- **Package selection history**: Track all package selections and changes
- **Interaction logging**: Complete chat history and user interactions
- **Row Level Security**: All tables protected with RLS policies

## Table Relationships

### Core Tables
1. **packages** - Internet service packages with pricing and features
2. **coverage_areas** - Geographic regions where service is available
3. **customers** - Main customer records with journey tracking

### Activity Tables
4. **customer_interactions** - All chat messages and user actions
5. **customer_journey_events** - Stage transitions in customer lifecycle
6. **customer_package_selections** - Package selection history

## Custom Data Types

### Enums
- **customer_status**: active, inactive, pending, cancelled, suspended, churned
- **journey_stage**: awareness, consideration, decision, retention, advocacy, churned
- **language_code**: en (English), af (Afrikaans), zu (isiZulu)
- **interaction_type**: message, quick_reply, location_share, package_selection, consent, coverage_check

## Key Business Rules

### Customer Journey Flow
1. **Awareness** → Customer first contacts via WhatsApp
2. **Consideration** → Customer views packages and coverage
3. **Decision** → Customer selects package and gives consent
4. **Retention** → Customer becomes active subscriber
5. **Advocacy** → Customer refers others
6. **Churned** → Customer cancels service

### Data Tracking
- All records tagged with `system_input_process = 'bolt'`
- Timestamps track creation and updates
- Foreign key relationships maintain data integrity
- Indexes optimize query performance

## Sample Data Included
- **3 Internet Packages**: Farm Connect (R15/day), Family Plus (R25/day), Business Pro (R45/day)
- **6 Coverage Areas**: Major South African cities and rural regions
- **Complete RLS Policies**: Secure access control for all tables

## Reporting Capabilities
- Customer acquisition metrics
- Package popularity analysis
- Geographic coverage performance
- Journey stage conversion rates
- Interaction volume trends
- Revenue and lifetime value tracking