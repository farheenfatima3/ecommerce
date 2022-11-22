const client=contentful.createClient({space:"aawl76qlc5wl",accessToken:"cy2tha4WseQvkepOyTa740MeiIFO6X9Wwk43GxjjkBs"})
const cartBtn=document.querySelector(".cart-btn");
const closeCartBtn=document.querySelector(".close-cart");
const clearCartBtn=document.querySelector(".clear-cart");
const cartDOM=document.querySelector(".cart");
const cartOverlay=document.querySelector(".cart-overlay");
const cartItems=document.querySelector(".cart-items");
const cartTotal=document.querySelector(".cart-total");
const cartContent=document.querySelector(".cart-content");
const productsDOM=document.querySelector(".product-center");
const showNow=document.querySelector('.banner-btn');
const view=document.querySelector('.products');
// cart
let cart=[];
let buttonDOM=[];

showNow.addEventListener('click',()=>{
 view.scrollIntoView()
})

// getting products
class Products{
    async getProducts(){
        try{
            let contentful=await client.getEntries({content_type:'sBags'});
            let product=contentful.items;
            product=product.map(item=>{
                const {title,price}=item.fields;
                const {id}=item.sys;
                const image=item.fields.image.fields.file.url;
                return {title,price,id,image}
            })
            return product
        }catch(e){
            console.log(e)
        }
    }
}
// display products
class UI{
    displayProducts(res){
        let a='';
     
        res.forEach(item=>{
            
            a+=
            `<article class="img-container">
                <div class="img-container">
                <img src=${item.image} alt="product" class="product-img"></img>
                <button class="bag-btn" data-id=${item.id}>
                <i class="fa fa-shopping-cart"></i>
                add to bag
                </button>
                </div>
                <h3>${item.title}</h3>
                <h4>${item.price}</h4>
            </article>`
            
        })
       
        productsDOM.innerHTML=a;
    }
    getBagButton(){
        let button=[...document.querySelectorAll('.bag-btn')];
        buttonDOM=button;
        button.forEach(btn=>{
            btn.addEventListener('click',(e)=>{
                let id=btn.dataset.id;
                e.target.innerText="In Cart";
                e.target.disabled=true;
                
                let cartItem={...Storage.getProduct(id),amount:1};
                //storing all the items which were clicked to add to cart in array called cart cartItem is object returned by storage.getProduct 
                cart=[...cart,cartItem];
                Storage.saveCart(cart);
                //setting values in html using queryselectors
                this.setCartValues(cart);
                this.addCartItem(cartItem);
                this.showCart();
            })
        })
    }
    setCartValues(cart){
        let tempTotal=0;
        let itemsTotal=0;
        cart.map(item=>{
            tempTotal+=item.price*item.amount;
            itemsTotal+=item.amount;
        })
        cartItems.innerText=itemsTotal;
  
        cartTotal.innerText=parseFloat(tempTotal.toFixed(2))
    }
    addCartItem(item){
        const div=document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML=`<img src=${item.image} alt='product'></img>
            <div>
                <h4>${item.title}</h4>
                <h5 class="price">${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
                <i class="fa fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fa fa-chevron-down" data-id=${item.id}></i>
            </div>`
            cartContent.appendChild(div)
    }
    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
    }
    setupApp(){
        //to get items added in cart initially on load
        cart=Storage.getcart();
        let button=[...document.querySelectorAll('.bag-btn')];
       
        for(let i=0;i<button.length;i++){
            for(let j=0;j<cart.length;j++){
                if(cart[j].id===button[i].dataset.id){
                button[i].disabled=true
                button[i].innerText='In Cart'
                }
            }
        }
        
        this.setCartValues(cart);
        
        this.populate(cart);
        cartBtn.addEventListener('click',this.showCart);
        closeCartBtn.addEventListener('click',this.hideCart);
    }
    populate(cart){
        cart.forEach(item=>this.addCartItem(item))
    }
    hideCart(){
        cartOverlay.classList.remove('transparentBcg');
        cartDOM.classList.remove('showCart');
    }
    cartLogic(){
        // clear cart button
        clearCartBtn.addEventListener('click',()=>{
            this.clearCart()
        })
        // cart functionality
        //checking parent element and checking its classlist on click
        cartContent.addEventListener('click',event=>{
            if(event.target.classList.contains('remove-item')){
                let removeItem=event.target;
                let id=removeItem.dataset.id;
                //remove single item(html) from cartoverlay
                cartContent.removeChild(removeItem.parentElement.parentElement);
                //updates localstorage, button,closes cartoverlay
                this.removeItems(id);
                if(cartContent.children.length<1){
                    this.hideCart()
                }
            }else if(event.target.classList.contains('fa-chevron-up')){
                let addAmount=event.target;
                let id=addAmount.dataset.id;
                //access array of cart find which object is clicked and manipulate the amount of object
                let tempItem=cart.find(item=>item.id===id);
                tempItem.amount=tempItem.amount+1;
                // tempItem.price=tempItem.price*tempItem.amount
                //update in localStorage
                Storage.saveCart(cart);
                this.setCartValues(cart);
                //display on ui
                addAmount.nextElementSibling.innerText=tempItem.amount;
                
            }else if(event.target.classList.contains('fa-chevron-down')){
                let lowerAmount=event.target;
                let id=lowerAmount.dataset.id;
                let tempItem=cart.find(itemid=>itemid.id===id);
                tempItem.amount=tempItem.amount-1;
                
                if(tempItem.amount>0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText=tempItem.amount;
                }else{
                     //if decreasing item quantity less than 1 then remove from html and update in localstorage
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItems(id);
                    this.hideCart()
                }
            }
        })
    }
    clearCart(){
        let cartItems=cart.map(item=>item.id);
        cartItems.forEach(id=>this.removeItems(id));
        //using while loop to remove html elements from cartoverlay so that it loops till length is greater than 0 and stops if length is 0 
        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0]);
            this.hideCart()
        }
        
    }
        removeItems(id){
            //each id comes and filter will return empty array
            cart=cart.filter(item=>item.id!==id);
            this.setCartValues(cart);
            Storage.saveCart(cart);
            //enable the add button
            let button=this.getSingleButton(id);
            button.disabled=false;
            button.innerHTML=`<i class="fa fa-shopping-cart">add to cart</i>`
        }
        getSingleButton(id){
            return buttonDOM.find(button=>button.dataset.id===id);
        
    }
   
}
 // local storage
 class Storage{
    //storing in localstorage all items as objects
    static local(res){
        localStorage.setItem('objects',JSON.stringify(res))
    }
    //getting all items from localstorage to find item clicked by add to cart
    static getProduct(id){
        let product=JSON.parse(localStorage.getItem('objects'));
        return product.find(prod=>prod.id===id)
    }
    static saveCart(cart){
       return localStorage.setItem('cart',JSON.stringify(cart))
    }
    static getcart(){
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }
}
document.addEventListener("DOMContentLoaded",()=>{
    const ui=new UI();
    const products=new Products();
    //to load the data initially on page load
    // ui.setupApp();
    products.getProducts().then(res=>{
        ui.displayProducts(res)
        Storage.local(res)
    }).then(()=>{
        ui.setupApp();
        ui.getBagButton();
        ui.cartLogic()
    })
   
})



