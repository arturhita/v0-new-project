import { getSettings } from "@/lib/actions/settings.actions"
import { updateSettings } from "@/lib/actions/settings.actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default async function LegalSettingsPage() {
  const settings = await getSettings()

  return (
    <div className="p-6">
      <form action={updateSettings}>
        <Card>
          <CardHeader>
            <CardTitle>Documenti Legali</CardTitle>
            <CardDescription>
              Gestisci i contenuti delle pagine legali come Privacy Policy, Cookie Policy e Termini e Condizioni.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="terms_and_conditions">Termini e Condizioni</Label>
              <Textarea
                id="terms_and_conditions"
                name="terms_and_conditions"
                rows={15}
                defaultValue={settings.termsConditions}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="privacy_policy">Privacy Policy</Label>
              <Textarea id="privacy_policy" name="privacy_policy" rows={15} defaultValue={settings.privacyPolicy} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cookie_policy">Cookie Policy</Label>
              <Textarea id="cookie_policy" name="cookie_policy" rows={15} defaultValue={settings.cookiePolicy} />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit">Salva Modifiche</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
