'use client'
import { useAppStore } from '@/components/app-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import envConfig from '@/config'
import { toast } from '@/hooks/use-toast'
import { generateSocketInstance, getAccessTokenFromLocalStorage, handleErrorApi } from '@/lib/utils'
import { useLoginMutation } from '@/queries/useAuth'
import { LoginBody, LoginBodyType } from '@/schemaValidations/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useRouter } from '@/i18n/routing'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { SearchParamsLoader, useSearchParamsLoader } from '@/components/search-params-loader'
import { useTranslations } from 'next-intl'
import { LoaderCircle } from 'lucide-react'

const getOauthGoogleUrl = () => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth'
  const options = {
    redirect_uri: envConfig.NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI,
    client_id: envConfig.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'].join(
      ' '
    )
  }
  const qs = new URLSearchParams(options)
  return `${rootUrl}?${qs.toString()}`
}
const googleOauthUrl = getOauthGoogleUrl()

export default function LoginForm() {
  const t = useTranslations('Login')
  const errorMessageT = useTranslations('ErrorMessage')
  const loginMutation = useLoginMutation()
  const { searchParams, setSearchParams } = useSearchParamsLoader()
  const clearTokens = searchParams?.get('clearTokens')
  const router = useRouter()
  const setRole = useAppStore((state) => state.setRole)
  const setSocket = useAppStore((state) => state.setSocket)

  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody), // ✅ Để RHF nhận lỗi, không throw
    defaultValues: { email: '', password: '' }
  })

  const onSubmit = async (data: LoginBodyType) => {
    if (loginMutation.isPending) return
    try {
      const response = await loginMutation.mutateAsync(data)
      setRole(response.payload.data.account.role)
      toast({
        description: response.payload.message
      })
      router.push('/manage/dashboard')
      setSocket(generateSocketInstance(response.payload.data.accessToken))
    } catch (error) {
      handleErrorApi({ error, setError: form.setError })
    }
  }

  useEffect(() => {
    if (clearTokens) {
      setRole(undefined)
    }
  }, [clearTokens, setRole])

  return (
    <Card className='mx-auto max-w-sm'>
      <SearchParamsLoader onParamReceived={setSearchParams} />
      <CardHeader>
        <CardTitle className='text-2xl'>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            className='space-y-2 max-w-[600px] flex-shrink-0 w-full'
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className='grid gap-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className='grid gap-2'>
                      <Label htmlFor='email'>{t('emailLabel')}</Label>
                      <Input id='email' type='email' placeholder={t('emailPlaceholder')} required {...field} />
                      <FormMessage>
                        {fieldState.error?.message && errorMessageT(fieldState.error.message as any)}
                      </FormMessage>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className='grid gap-2'>
                      <div className='flex items-center'>
                        <Label htmlFor='password'>{t('passwordLabel')}</Label>
                      </div>
                      <Input id='password' type='password' required {...field} />
                      <FormMessage>
                        {fieldState.error?.message && errorMessageT(fieldState.error.message as any)}
                      </FormMessage>
                    </div>
                  </FormItem>
                )}
              />
              <Button type='submit' className='w-full' disabled={loginMutation.isPending}>
                {loginMutation.isPending && <LoaderCircle className='mr-2 h-4 w-4 animate-spin' />}
                {loginMutation.isPending ? t('loggingIn') : t('loginButton')}
              </Button>
              <Link href={googleOauthUrl}>
                <Button variant='outline' className='w-full' type='button'>
                  {t('loginWithGoogle')}
                </Button>
              </Link>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
