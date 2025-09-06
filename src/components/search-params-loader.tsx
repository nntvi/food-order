import { ReadonlyURLSearchParams, useSearchParams } from 'next/navigation'
import React, { Suspense, useEffect, useState } from 'react'

type SearchParamsLoaderProps = {
  onParamReceived: (params: ReadonlyURLSearchParams) => void
}
export const SearchParamsLoader = Suspender
function Suspender(props: SearchParamsLoaderProps) {
  return (
    <Suspense>
      <Suspendend {...props} />
    </Suspense>
  )
}

function Suspendend({ onParamReceived }: SearchParamsLoaderProps) {
  const searchParams = useSearchParams()
  useEffect(() => {
    onParamReceived(searchParams)
  })
  return null
}

export const useSearchParamsLoader = () => {
  const [searchParams, setSearchParams] = useState<ReadonlyURLSearchParams | null>(null)
  return {
    searchParams,
    setSearchParams
  }
}
