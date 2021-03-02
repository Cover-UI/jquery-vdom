// component rendering will optimize

$.fn.COMPONENTS = {};

$.fn._isComponent = function (label){
    return this.COMPONENTS[label] != undefined; 
}

function  _beautyAttr(attr){
    var attrs = {};
    for (let i = 0; i < attr.length; i++) {
        const at = attr[i];
        attrs[at.name] = at.value;
    }
    return attrs;
}

function _getVdom(el){
    let childs = []; 
    
    if(el.nodeName != "#text"){
        for (let i = 0; i < el.childNodes.length; i++) {

            var element = _getVdom(el.childNodes[i]);
            childs.push(element);       
        }
        return $().h( el.tagName, _beautyAttr(el.attributes), childs ); 
    }else{
        return el.data;
    }
  

    
}

$.fn.h = function (nodeName, attributes, children) {
    return { nodeName, attributes, children }
}

$.fn.renderNode = function(vnode){
    
    let el;

    if (typeof vnode == 'string') return document.createTextNode(vnode)
    const { nodeName, attributes, children } = vnode;
   
    if ( !this._isComponent(nodeName) ) {
      el = document.createElement(nodeName)
  
      for (let key in attributes) {
        el.setAttribute(key, attributes[key])
      }
    } else { 
      // initiate our component
      let c = this.COMPONENTS[nodeName](attributes);
      let vTemp = document.createElement("div");
      vTemp.innerHTML = c.template;
      
      el = this.renderNode( _getVdom( vTemp.firstElementChild ) );
    }
    // recursively do this to all of its children
    children.forEach(child => { 
        if(child.nodeName == "SCRIPT" || child.nodeName == "LINK" ){
            console.warn("Parent element shouldn't include script or link element.")
        }else{
            el.appendChild( this.renderNode(child) );
        }
    })
  
    return el
}
  

  
$.fn.diff = function(dom, vnode, parent) {
    if (dom) {
      if (typeof vnode === 'string') {
        dom.nodeValue = vnode
  
        return dom
      } 
      if (typeof vnode.nodeName === 'function') {
        const component = new vnode.nodeName(vnode.attributes)
        const rendered = component.render(component.props, component.state)
  
        this.diff(dom, rendered)
        return dom
      }
  
      // Naive check for number of chilren of vNode and dom
      if (vnode.children.length !== dom.childNodes.length) {
        dom.appendChild(
          // render only the last child
          this.renderNode(vnode.children[vnode.children.length - 1])
        )
      }
  
      // run diffing for children
      dom.childNodes.forEach((child, i) => this.diff(child, vnode.children[i]))
  
      return dom
    } else {
      const newDom = this.renderNode(vnode)
      parent.innerHTML = newDom.innerHTML;
      return newDom
    }
}

$.fn.render = function(){
    this.diff(undefined, _getVdom(this[0]), this[0]);
}

$.fn.component = function(id,callback){
    this.COMPONENTS[id.toUpperCase()] = callback;
}


