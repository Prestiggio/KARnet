import React from 'react'
import Dropzone from 'react-dropzone'
import { useRef } from 'react';

export default function ProfilePic(props: any) {
    const imgContainer = useRef<any>()

    return <Dropzone onDrop={async acceptedFiles => {
        for(let file of acceptedFiles) {
            if(/^image/.test(file.type)) {
                var reader = new FileReader();
    
                reader.onload = function (e:any) {
                    imgContainer.current.setAttribute('src', e.target.result);
                };
    
                reader.readAsDataURL(file);
            }
            const data = new FormData()
            data.append('media', file)
            data.append('fname', props.data.picture)
            const response = await fetch('/mg/Arsidiosezy-Antananarivo/Vikaria-Episkopaly-Afovoany/Ditrika-Mahamasina/EKAR-Ambatonilita/filan-kevitra/upload', {
                method: 'POST',
                body: data
            })
            const rsp = await response.json()
            props.onChangePic('/files/'+rsp.filename)
        }
    }}>
        {({ getRootProps, getInputProps }) => (
            <section>
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <img
                        ref={imgContainer}
                        alt=""
                        src={props.data.picture ?? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                        className={`${props.size} object-cover rounded-full`}
                    />
                </div>
            </section>)}
    </Dropzone>
}