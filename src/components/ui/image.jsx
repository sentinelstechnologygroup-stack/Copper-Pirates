import * as React from 'react';
const Image=React.forwardRef(
 /** @param {Record<string, any>} props */
 ({src,alt='',fittingType,originWidth,originHeight,focalPointX,focalPointY,quality,style,...props},ref)=><img ref={ref} src={src} alt={alt} decoding="async" style={{objectFit:fittingType==='fit'?'contain':'cover',...style}} {...props}/>
);
Image.displayName='Image';
export {Image};
