export function AdminApprovalNotice({ onApproved }: { onApproved: () => void }) {
  return (
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold mb-4">En attente d'approbation</h2>
      <p>Votre demande est en cours d'examen par nos administrateurs.</p>
      {/* Ajouter logique de vérification du statut */}
    </div>
  );
}