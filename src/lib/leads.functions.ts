import { createServerFn } from '@tanstack/react-start'

export const submitLead = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => {
    const raw = (data ?? {}) as Record<string, unknown>
    const name = String(raw['name'] ?? '').trim().slice(0, 120)
    const email = String(raw['email'] ?? '').trim().slice(0, 200)
    const message = String(raw['message'] ?? '').trim().slice(0, 4000)
    const budget = raw['budget'] ? String(raw['budget']).slice(0, 60) : null
    const interests = Array.isArray(raw['interests'])
      ? (raw['interests'] as unknown[]).map((i) => String(i).slice(0, 80)).slice(0, 20)
      : []

    if (!name || !message) throw new Error('Name and project details are required.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid email is required.')

    return { name, email, message, budget, interests }
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

    const { data: inserted, error } = await supabaseAdmin
      .from('leads')
      .insert({
        name: data.name,
        email: data.email,
        message: data.message,
        budget: data.budget,
        interests: data.interests,
      })
      .select('id, created_at')
      .single()

    if (error) throw new Error(error.message)

    try {
      const { sendTemplateEmail } = await import('@/lib/email-templates/send-email')
      await sendTemplateEmail('lead-notification', '', {
        idempotencyKey: `lead-notification-${inserted.id}`,
        replyTo: data.email,
        templateData: {
          name: data.name,
          email: data.email,
          message: data.message,
          budget: data.budget,
          interests: data.interests,
          submittedAt: new Date(inserted.created_at).toUTCString(),
        },
      })
    } catch (err) {
      // The lead is saved; notification failure must not break the submission.
      console.error('[leads] notification email failed', err)
    }

    return { ok: true as const }
  })
