import React from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog"

const PolicyModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Policy and Terms</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <h2 className="text-lg font-bold">Terms of Service</h2>
          <p className='text-slate-300'>
          By using this web application, you agree to comply with and be bound by these Terms and Conditions. This platform is provided "as is" without any warranties, and your use of the application is at your own risk. We reserve the right to modify or discontinue the service at any time without prior notice. Unauthorized use of this application may give rise to a claim for damages and/or be a criminal offense. By continuing to use the application, you acknowledge and accept these terms in full.
          </p>
          <h2 className="text-lg font-bold">Privacy Policy</h2>
          <p className='text-slate-300'>
          We value your privacy and are committed to protecting your personal information. This policy outlines how we collect, use, and safeguard your data when you use our application. We only collect the information necessary to provide and improve our services. Your data will not be sold or shared with third parties without your consent, except as required by law. By using the application, you consent to the collection and use of your information as described in this policy.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PolicyModal
