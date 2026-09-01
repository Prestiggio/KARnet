'use client'

import { DotLottieReact, type DotLottie } from '@lottiefiles/dotlottie-react';
import { useEffect, useRef } from 'react';
import { useMenu } from './menu-context';

export default function CloseButton() {

    const { closed, toggle } = useMenu()
    const btn = useRef<DotLottie>(null)

    useEffect(()=>{
        if(closed) {
            btn.current?.setSegment(50, 75)
            btn.current?.setFrame(50)
            btn.current?.play()
            document.getElementById('footer')?.classList.add('-ml-120')
            document.getElementById('content')?.classList.remove('blur-xs')
        }
        else {
            btn.current?.setSegment(7, 28)
            btn.current?.setFrame(7)
            btn.current?.play()
            document.getElementById('footer')?.classList.remove('-ml-120')
            document.getElementById('content')?.classList.add('blur-xs')
        }
    }, [closed])

    return <button type="button" className="pt-4 fixed z-100 right-0 md:hidden grow max-w-2/12 dark:text-white" onClick={toggle}>
        <DotLottieReact
            src="/lottie/close-anim.lottie"
            autoplay={false}
            className='dark:invert'
            dotLottieRefCallback={(dotLottie) => {
                btn.current = dotLottie;
            }}
        />
      </button>
}