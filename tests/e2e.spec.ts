import { test, expect } from '@playwright/test'

test('home loads', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /educación que/i })).toBeVisible()
})

test('dashboard redirects to login when unauthenticated', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login\?redirect=\/dashboard/)
})

test('inscripcion page renders form', async ({ page }) => {
  await page.goto('/inscripcion')
  await expect(page.getByRole('heading', { name: /formulario de inscripción/i })).toBeVisible()
})

test('noticias page renders', async ({ page }) => {
  await page.goto('/noticias')
  await expect(page.getByRole('heading', { name: /noticias institucionales/i })).toBeVisible()
})
