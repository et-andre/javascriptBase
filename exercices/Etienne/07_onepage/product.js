import * as Utl from "./utilities.js";

import * as Bk  from "./basket.js";

export class Produit {
    constructor(desc, prix) {
        this.desc = desc;
        this.prix = prix;
    }
}

export let prods = {};

// load products from storage, or reset products array
export function loadProds()
{
    prods = JSON.parse(sessionStorage.getItem(Utl.storPrd));
    if (!prods)
    {
        // not yet any product
        prods = {};
        return;
    }

    // already some products
    for (let prd in prods)
    {
        prods[prd] = new Produit(prods[prd].desc, prods[prd].prix);
    }

} // loadProds

export function productsList()
{
    let opbody = Utl.clr("Products List", true);

    let slctUsr = Utl.getUserSelected();

    // table and its header
    let tbprd       = document.createElement("table");
    opbody.appendChild(tbprd);
    tbprd.className = "table";
    tbprd.appendChild(Utl.tbHeader(["", "Description", "Price", "Quantity"]));

    // table body
    let tbbprd = document.createElement("tbody");
    tbprd.appendChild(tbbprd);

    let idx = 0;
    for (let prd in prods)
    {
        idx += 1;
        let tr = document.createElement("tr");

        // col 0: button to remove product
        let btprem = Utl.addButton(tr, "Delete", "prem", idx, "btn btn-danger");

        // col 1-2: description & price
        Utl.addCell(tr, prods[prd].desc);
        Utl.addCell(tr, prods[prd].prix);

        // col 3: qty & add button
        let td3  = document.createElement("td");
        tr.appendChild(td3);
        let iqty   = Utl.addInput (td3, "number", "pqty_", idx);
        let btpadd = Utl.addButton(td3, "Add"   , "padd" , idx, "btn btn-primary", slctUsr ? "enabled" : "hidden");

        // add row to table body
        tbbprd.appendChild(tr);

        // button remove product from products array
        btprem.addEventListener("click", e => {
            e.preventDefault();

            // delete product: also delete from basket, if any
            delete Bk.bask[prods[prd].desc];
            delete prods  [prods[prd].desc];
            // both modified, both saved
            sessionStorage.setItem(Utl.storPrd, JSON.stringify(prods  ));
            sessionStorage.setItem(Utl.storBsk, JSON.stringify(Bk.bask));
            // refresh page
            productsList();

        }) // btprem.addEventListener("click",
    
        // button add qty of product to basket
        btpadd.addEventListener("click", e => {
            e.preventDefault();

            if (!checkQty(iqty.value)) return;

            // get product and qty
            let pr  = prods[prd];
            let qty = parseInt(iqty.value);
            iqty.value = "";    // reset qty on screen for next use
            // already in basket ?
            if (!Bk.bask[pr.desc])
            {
                // create empty
                Bk.bask[pr.desc] = new Bk.Panier(slctUsr.email, pr.desc, 0, 0)
            }
            // update
            Bk.bask[pr.desc].qte  +=    qty ;
            Bk.bask[pr.desc].prix  = pr.prix;
            // no more ? (means qty < 0)
            if (Bk.bask[pr.desc].qte <= 0)
            {
                // remove
                delete Bk.bask[pr.desc];
            }
            // update basket
            sessionStorage.setItem(Utl.storBsk, JSON.stringify(Bk.bask));
            // refresh page
            productsList();

        }) // btpadd.addEventListener("click",
    
    } // for (prd in prods)

    // footer: to create new product
    let tbfprd = document.createElement("tfoot");
    let tfr    = document.createElement("tr");

    // col 0: button create product
    let btnnprod = Utl.addButton(tfr, "New Product", "nprod", -1, "btn btn-primary");

    // col 1 & 2: desc & price, hidden !
    Utl.addInput(tfr, "text"  , "prddesc", -1, "hidden");
    Utl.addInput(tfr, "number", "prdprix", -1, "hidden");

    // col 3: buttons submit & cancel, hidden !
    let tf3 = document.createElement("td");
    tfr.appendChild(tf3);
    let btncprod  = Utl.addButton(tf3, "Create", "cprod" , -1, "btn btn-primary"  , "hidden");
    let btncancel = Utl.addButton(tf3, "Cancel", "cancel", -1, "btn btn-secondary", "hidden");

    tbfprd.appendChild(tfr);
    tbprd.appendChild(tbfprd);

    // button new product (left): show fields to fill them
    btnnprod.addEventListener("click", e => {
        e.preventDefault();

        // hide "New Product", show other fields & button
        let btnnprod  = document.getElementById("btnnprod" );
        let inpdesc   = document.getElementById("prddesc"  );
        let inpprix   = document.getElementById("prdprix"  );
        let btncprod  = document.getElementById("btncprod" );
        let btncancel = document.getElementById("btncancel");
        btnnprod.removeAttribute ("enabled"    );
        btnnprod.setAttribute    ("hidden" , "");
        inpdesc.removeAttribute  ("hidden"     );
        inpdesc.setAttribute     ("enabled", "");
        inpprix.removeAttribute  ("hidden"     );
        inpprix.setAttribute     ("enabled", "");
        btncprod.removeAttribute ("hidden"     );
        btncprod.setAttribute    ("enabled", "");
        btncancel.removeAttribute("hidden"     );
        btncancel.setAttribute   ("enabled", "");

    }) // btnnprod.addEventListener("click",

    // button create product (right 1): fields filled, create
    btncprod.addEventListener("click", e => {
        e.preventDefault();

        // get and check values
        let inpdesc = document.getElementById("prddesc").value;
        let inpprix = document.getElementById("prdprix").value;
        if (!checkNewProd(inpdesc, inpprix)) return;
    
        // create product
        let prd = new Produit(inpdesc, parseInt(inpprix));
        // add to array and storage
        prods[prd.desc] = prd;
        sessionStorage.setItem(Utl.storPrd, JSON.stringify(prods));
        // refresh page
        productsList();

    }) // btncprod.addEventListener("click",

    // button cancel product (right 1): fields filled, create
    btncancel.addEventListener("click", e => {
        e.preventDefault();

        // refresh page
        productsList();

    }) // btncancel.addEventListener("click",

} // productsList

// check qty for remove
// return true if no error
//        false if any error
// display message error if any
// 1 param:
//   qty: value of prddesc field
function checkQty(qty)
{
    if (Utl.notCheck(         qty.trim() ==  "" , 'Field "Quantity" must be filled'           )) return false;
    if (Utl.notCheck(parseInt(qty)       === NaN, 'Field "Quantity" must be is not a number'  )) return false;
    if (Utl.notCheck(parseInt(qty)       <=   0 , 'Field "Quantity" must be a positive number')) return false;

    return true;

} // function checkFields(inpprix, inpprix)

// check all fields for a new product
// return true if no error
//        false if any error
// display message error if any
// 2 params:
//   inpdesc: value of prddesc field
//   inpprix: value of prdprix field
function checkNewProd(inpdesc, inpprix)
{
    if (Utl.notCheck(         inpdesc.trim() ==  "" , 'The field "Description" must be filled'     )) return false;
    if (Utl.notCheck(         inpprix.trim() ==  "" , 'The field "Price" must be filled'           )) return false;
    if (Utl.notCheck(parseInt(inpprix)       === NaN, 'The field "Price" must be a number'         )) return false;
    if (Utl.notCheck(parseInt(inpprix)       <=   0 , 'The field "Price" must be a positive number')) return false;

    return true;

} // function checkFields(inpprix, inpprix)
