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
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
            EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
            IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
            CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
            TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
            SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
          </p>
          <h2 className="text-lg font-bold">Privacy Policy</h2>
          <p className='text-slate-300'>
            This site uses JSON Web Tokens and a Key-Value database for sessions
            and WebAuthn authenticators which resets every 2 hours.
          </p>
          <p className='text-slate-300'>
            Data provided to this site is exclusively used to support signing in
            and is not passed to any third party services, other than via SMTP or
            OAuth for the purposes of authentication. And Vercel KV / Upstash for
            hosting the Key Value store. This data is deleted every 2 hours via
            cron job.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PolicyModal
