export interface Config {
  cypressDir: string
  testDir: string
  testRegex: RegExp
  outDir: string
}

export interface FeatureMap { [feature: string]: string[] }

export interface TreeNode {
  path?: string;
  children: { [key: string]: TreeNode };
}
