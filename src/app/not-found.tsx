import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Seite nicht gefunden</CardTitle>
          <CardDescription>
            Der angeforderte Bereich existiert nicht mehr oder die ID ist nicht gueltig.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/scripts">Zur Skriptuebersicht</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
