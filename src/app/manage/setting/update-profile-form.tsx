'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { useAccountMe, useUpdateMe } from '@/queries/useAcccount'
import { uploadMediaMutation } from '@/queries/useMedia'
import { UpdateMeBody, UpdateMeBodyType } from '@/schemaValidations/account.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { Upload } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

export default function UpdateProfileForm() {
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const updateMeMutation = useUpdateMe()
  const useUploadMedia = uploadMediaMutation()
  const form = useForm<UpdateMeBodyType>({
    resolver: zodResolver(UpdateMeBody),
    defaultValues: {
      name: '',
      avatar: ''
    }
  })
  console.log(form.formState.errors)

  const avatar = form.watch('avatar')
  const name = form.watch('name')
  const previewAvatar = file ? URL.createObjectURL(file) : avatar
  const { data, refetch } = useAccountMe()
  useEffect(() => {
    if (data) {
      const { name, avatar } = data.payload.data
      form.reset({ name, avatar: avatar || '' })
    }
  }, [form, data])

  const onSubmit = async (values: UpdateMeBodyType) => {
    if (updateMeMutation.isPending) return
    try {
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const { payload } = await useUploadMedia.mutateAsync(formData)
        values.avatar = payload.data
      }
      const result = await updateMeMutation.mutateAsync(values)
      toast({
        description: result.payload.message
      })
      refetch()
    } catch (error) {
      console.log('🚀 ~ onSubmit ~ error:', error)
    }
  }
  const reset = () => {
    form.reset({
      name: '',
      avatar: ''
    })
  }
  return (
    <Form {...form}>
      <form
        noValidate
        className='grid auto-rows-max items-start gap-4 md:gap-8'
        onReset={reset}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Card x-chunk='dashboard-07-chunk-0'>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid gap-6'>
              <FormField
                control={form.control}
                name='avatar'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex gap-2 items-start justify-start'>
                      <Avatar className='aspect-square w-[100px] h-[100px] rounded-md object-cover'>
                        <AvatarImage src={previewAvatar} />
                        <AvatarFallback className='rounded-none'>{name}</AvatarFallback>
                      </Avatar>
                      <input
                        type='file'
                        accept='image/*'
                        className='hidden'
                        ref={avatarInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setFile(file)
                            field.onChange('http://localhost:3000/' + field.name)
                          }
                        }}
                      />
                      <button
                        className='flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed'
                        type='button'
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Upload className='h-4 w-4 text-muted-foreground' />
                        <span className='sr-only'>Upload</span>
                      </button>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <div className='grid gap-3'>
                      <Label htmlFor='name'>Tên</Label>
                      <Input id='name' type='text' className='w-full' {...field} />
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <div className=' items-center gap-2 md:ml-auto flex'>
                <Button variant='outline' size='sm' type='reset'>
                  Hủy
                </Button>
                <Button size='sm' type='submit'>
                  Lưu thông tin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}
