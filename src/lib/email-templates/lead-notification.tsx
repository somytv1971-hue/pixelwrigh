import React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'
import { site } from '../site'

interface Props {
  name?: string
  email?: string
  message?: string
  interests?: string[]
  budget?: string | null
  submittedAt?: string
}

const Email = ({ name, email, message, interests, budget, submittedAt }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`New enquiry from ${name || 'a visitor'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>{site.name} · New enquiry</Text>
        <Heading style={heading}>{name || 'A visitor'} wants to talk</Heading>

        <Section style={card}>
          <Text style={row}>
            <span style={label}>Name</span> {name || '—'}
          </Text>
          <Text style={row}>
            <span style={label}>Email</span>{' '}
            {email ? <Link href={`mailto:${email}`} style={link}>{email}</Link> : '—'}
          </Text>
          <Text style={row}>
            <span style={label}>Interested in</span>{' '}
            {interests && interests.length ? interests.join(', ') : '—'}
          </Text>
          <Text style={row}>
            <span style={label}>Budget</span> {budget || '—'}
          </Text>
          {submittedAt ? (
            <Text style={row}>
              <span style={label}>Received</span> {submittedAt}
            </Text>
          ) : null}
        </Section>

        <Text style={label}>Project details</Text>
        <Text style={body}>{message || '—'}</Text>

        <Hr style={hr} />
        <Text style={footer}>
          Reply directly to this email to answer {name || 'them'}. All enquiries are also
          stored in your admin Leads inbox.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `New enquiry from ${data['name'] || 'your website'}`,
  displayName: 'New lead notification',
  to: site.email,
  previewData: {
    name: 'Jane Doe',
    email: 'jane@company.com',
    interests: ['Site from scratch', 'UX/UI design'],
    budget: '$10k – $25k',
    message: 'We need a new marketing site before our Series A launch.',
    submittedAt: 'Aug 14, 2026',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const eyebrow = {
  fontSize: '12px',
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  color: '#7c3aed',
  margin: '0 0 8px',
  fontWeight: 700,
}
const heading = { fontSize: '26px', lineHeight: '1.25', color: '#0b0b12', margin: '0 0 20px' }
const card = {
  backgroundColor: '#f6f4ff',
  borderRadius: '16px',
  padding: '18px 20px',
  margin: '0 0 20px',
}
const row = { fontSize: '14px', color: '#0b0b12', margin: '0 0 8px' }
const label = {
  fontSize: '12px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  color: '#6b6b7b',
  fontWeight: 700,
}
const body = {
  fontSize: '15px',
  lineHeight: '1.6',
  color: '#0b0b12',
  whiteSpace: 'pre-wrap' as const,
  margin: '6px 0 0',
}
const link = { color: '#7c3aed' }
const hr = { borderColor: '#e6e6ef', margin: '24px 0 16px' }
const footer = { fontSize: '12px', color: '#6b6b7b', margin: 0 }
