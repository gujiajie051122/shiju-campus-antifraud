/** Approved logo artwork; inverse is the monochrome version for dark surfaces. */
export function BrandLogo({inverse=false}:{inverse?:boolean}) {
  return <img className={`shiju-logo${inverse?" shiju-logo--inverse":""}`} src="/brand/shiju-logo.webp" alt="识局" width={720} height={210} draggable={false}/>;
}
