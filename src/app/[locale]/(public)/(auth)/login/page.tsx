import LoginForm from '@/app/[locale]/(public)/(auth)/login/login-form'

export default async function Login({ params }: { params: Promise<{ locale: string }> }) {
  // Enable static rendering
  const { locale } = await params
  return (
    <div className='min-h-screen flex items-center justify-center'>
      <LoginForm />
    </div>
  )
}
