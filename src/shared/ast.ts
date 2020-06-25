type Tree = ParaNode[];

type NodeType = 'paragraph' | 'text' | 'br' | 'tagref' | 'image' | 'link' | 'emphasis' | 'strong';

interface Node {
    type: NodeType;
}
interface ContainerNode extends Node {
    content: InlineNode[];
}
interface InlineNode extends Node {
    type: Exclude<NodeType, 'paragraph'>;
}

interface ParaNode extends ContainerNode {
    type: 'paragraph';
}
interface LeafNode extends InlineNode {
    type: 'text' | 'tagref' | 'br';
}
interface TextLeafNode extends LeafNode {
    type: 'text' | 'tagref';
    text: string;
}
interface TextNode extends TextLeafNode {
    type: 'text';
}
interface TagRefNode extends TextLeafNode {
    type: 'tagref';
    tag?: string;
}
interface BreakNode extends LeafNode {
    type: 'br';
}
interface StylingNode extends InlineNode, ContainerNode {
    type: 'emphasis' | 'strong';
}
interface EmphasisNode extends StylingNode {
    type: 'emphasis';
}
interface StrongNode extends StylingNode {
    type: 'strong';
}
interface MediaNode extends InlineNode, ContainerNode {
    type: 'link' | 'image';
    title: string;
    url: string;
}
interface LinkNode extends MediaNode {
    type: 'link';
}
interface ImageNode extends MediaNode {
    type: 'image';
    nsfw: false | 'R18' | 'R18G';
}
