// « < » est remplacé par sa forme échappée pour qu'aucun texte ne puisse fermer la balise <script>
const LT = String.fromCharCode(92) + "u003c";

/** Données structurées schema.org, injectées telles quelles dans la page. */
export function JsonLd({ data }: { data: object | object[] }) {
  const list = Array.isArray(data) ? data : [data];
  return (
    <>
      {list.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d).split("<").join(LT) }} />
      ))}
    </>
  );
}
