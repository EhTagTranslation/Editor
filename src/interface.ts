
export interface ETRooot {
  data: ETNamespace[];
  head: any;
  remote: string;
  version: number;
}

export interface ETNamespace {
  count: number;
  data: {[row: string]: ETTag};
  namespace: string;
}

export interface ETTag {
  intro: string;
  links: string;
  name: string;
}

export interface ETItem {
  raw: string;
  intro: string;
  links: string;
  name: string;
  namespace: string;
}
