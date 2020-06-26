import { TreeAdapter, Attribute } from 'parse5';
import { ContainerNode, InlineNode, Node, Tree, NodeType, TextNode, ParaNode, LinkNode } from './interfaces/ehtag.ast';

const FRAGMENT_NODE = '#root';
export interface DocumentFragment {
    type: typeof FRAGMENT_NODE;
    content: Tree;
}

const props = {
    parent: new WeakMap<Node, ContainerNode>(),
    namespaceURI: new WeakMap<Node, string>(),
    attrs: new WeakMap<Node, Attribute[]>(),
};
type Props = keyof typeof props;
type PropValue<T extends Props> = typeof props[T] extends WeakMap<object, infer V> ? V : never;

function getProp<T extends Props>(node: Node, key: T): PropValue<T> | undefined {
    const map = props[key] as WeakMap<Node, PropValue<T>>;
    return map.get(node);
}

function setProp<T extends keyof typeof props>(node: Node, key: T, value?: PropValue<T>): void {
    const map = props[key] as WeakMap<Node, PropValue<T>>;
    if (value === undefined) {
        map.delete(node);
    } else {
        map.set(node, value);
    }
}

function getAttr(attrs: Attribute[], name: string): string | undefined {
    const attr = attrs.find((a) => a.name === name);
    return attr?.value;
}

const COMMENT_NODE = '#comment';
interface __CommentNode {
    type: typeof COMMENT_NODE;
    text: string;
}
const DOCUMENT_NODE = '#document';
interface __Document {
    type: typeof DOCUMENT_NODE;
    content: Node[];
}
const TEMPLATE_NODE = '#template';
interface __Template {
    type: typeof TEMPLATE_NODE;
    content: Node[];
}

class AstTreeAdapter implements TreeAdapter {
    adoptAttributes(recipient: Node, attrs: Attribute[]): void {
        // throw new Error('Method not implemented.');
    }
    appendChild(parentNode: ContainerNode, newNode: InlineNode): void {
        parentNode.content = parentNode.content ?? [];
        setProp(newNode, 'parent', parentNode);
        parentNode.content.push(newNode);
    }
    createCommentNode(data: string): __CommentNode {
        return { type: COMMENT_NODE, text: data };
    }
    createDocument(): __Document {
        return { type: DOCUMENT_NODE, content: [] };
    }
    createDocumentFragment(): DocumentFragment {
        return { type: FRAGMENT_NODE, content: [] };
    }
    createElement(tagName: string, namespaceURI: string, attrs: Attribute[]): Node {
        let node: Node;
        if (tagName === 'a') {
            node = {
                type: 'link',
                content: [],
                title: getAttr(attrs, 'title'),
                url: getAttr(attrs, 'href'),
            } as LinkNode;
        } else {
            node = {
                type: tagName as NodeType,
            } as Node;
        }
        setProp(node, 'namespaceURI', namespaceURI);
        setProp(node, 'attrs', attrs);
        return node;
    }
    detachNode(node: InlineNode): void {
        const parent = getProp(node, 'parent');
        if (parent) {
            const i = parent.content.indexOf(node);
            if (i >= 0) parent.content.splice(i, 1);
            setProp(node, 'parent');
        }
    }
    getAttrList(element: Node): Attribute[] {
        return getProp(element, 'attrs') ?? [];
    }
    getChildNodes(node: ContainerNode): Node[] {
        return node.content;
    }
    getCommentNodeContent(commentNode: __CommentNode): string {
        return commentNode.text;
    }
    getDocumentMode(document: import('parse5').Document): import('parse5').DocumentMode {
        throw new Error('Method not implemented.');
    }
    getDocumentTypeNodeName(doctypeNode: import('parse5').DocumentType): string {
        throw new Error('Method not implemented.');
    }
    getDocumentTypeNodePublicId(doctypeNode: import('parse5').DocumentType): string {
        throw new Error('Method not implemented.');
    }
    getDocumentTypeNodeSystemId(doctypeNode: import('parse5').DocumentType): string {
        throw new Error('Method not implemented.');
    }
    getFirstChild(node: ContainerNode): Node {
        return node.content?.[0];
    }
    getNamespaceURI(element: Node): string {
        return getProp(element, 'namespaceURI') ?? '';
    }
    getNodeSourceCodeLocation(
        node: Node,
    ): import('parse5').Location | import('parse5').StartTagLocation | import('parse5').ElementLocation {
        throw new Error('Method not implemented.');
    }
    getParentNode(node: Node): ContainerNode {
        return getProp(node, 'parent') as ContainerNode;
    }
    getTagName(element: Node): string {
        return element.type;
    }
    getTextNodeContent(textNode: TextNode): string {
        return textNode.text;
    }
    getTemplateContent(templateElement: Node): DocumentFragment {
        throw new Error('Method not implemented.');
    }
    insertBefore(parentNode: ContainerNode, newNode: InlineNode, referenceNode: InlineNode): void {
        const i = parentNode.content.indexOf(referenceNode);
        parentNode.content.splice(i, 0, newNode);
        setProp(newNode, 'parent', parentNode);
    }
    insertText(parentNode: ContainerNode, text: string): void {
        this.appendChild(parentNode, { type: 'text', text } as TextNode);
    }
    insertTextBefore(parentNode: ContainerNode, text: string, referenceNode: InlineNode): void {
        this.insertBefore(parentNode, { type: 'text', text } as TextNode, referenceNode);
    }
    isCommentNode(node: Node): boolean {
        return (node.type as string) === COMMENT_NODE;
    }
    isDocumentTypeNode(node: Node): boolean {
        return false;
    }
    isElementNode(node: Node): boolean {
        if (node.type === 'text') return false;
        if (NodeType.includes(node.type)) return true;
        const t = node.type as string;
        if (t === DOCUMENT_NODE || t === FRAGMENT_NODE || t === TEMPLATE_NODE) return true;
        return false;
    }
    isTextNode(node: Node): boolean {
        return node.type === 'text';
    }
    setDocumentMode(document: import('parse5').Document, mode: import('parse5').DocumentMode): void {
        throw new Error('Method not implemented.');
    }
    setDocumentType(document: import('parse5').Document, name: string, publicId: string, systemId: string): void {
        throw new Error('Method not implemented.');
    }
    setNodeSourceCodeLocation(
        node: import('parse5').Node,
        location: import('parse5').Location | import('parse5').StartTagLocation | import('parse5').ElementLocation,
    ): void {
        throw new Error('Method not implemented.');
    }
    setTemplateContent(templateElement: __Template, contentElement: DocumentFragment): void {
        throw new Error('Method not implemented.');
    }
}

class HtmlTreeAdapter extends AstTreeAdapter {}
class RawTreeAdapter extends AstTreeAdapter {}
class TextTreeAdapter extends AstTreeAdapter {}

export const astTreeAdapter = new AstTreeAdapter();
export const htmlTreeAdapter = new HtmlTreeAdapter();
export const rawTreeAdapter = new RawTreeAdapter();
export const textTreeAdapter = new TextTreeAdapter();
