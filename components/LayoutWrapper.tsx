"use client"
import React, { ReactNode, Suspense, useEffect, useState } from "react";
type LayoutWrapperProps = {
    children: ReactNode;
}


const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
   
    return (
        <div className={`flex flex-col`}>
            <Suspense fallback={<p>Loading feed...</p>}>
            <div>
                {children}
            </div>
            </Suspense>
        </div>
    )
};

export default LayoutWrapper;
