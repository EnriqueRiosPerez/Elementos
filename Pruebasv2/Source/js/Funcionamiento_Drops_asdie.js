let ul_drop = document.querySelector(".Aside_Nav")
let elements = Array.from(ul_drop.querySelectorAll("li.F"))
let sub_menus = Array.from(ul_drop.querySelectorAll("li.SD"))

let boton_aside = document.getElementById("boton_aside")
console.log(ul_drop)
console.log("Menus")
console.log(elements)
console.log("Submenus")
console.log(sub_menus)
let actual 
// elements.forEach(element =>{
//     console.log(element)
    
//     element.addEventListener("click",async ()=>{
      
        
//         element.classList.toggle("open")

//     })
// })

// boton_aside.addEventListener("click", ()=>{
    
// })

//funciona pero solamete a los elemtos li y no me funcioan por que es 
// elements.forEach(element => {
//     element.addEventListener("click", () => {
//         // Primero cerramos todos los elementos abiertos
//         elements.forEach(el => {
//             if (el !== element) {
//                 el.classList.remove("open")
//             }
//         })

//         // Alternamos la clase solo en el que fue clickeado
//         element.classList.toggle("open")
//     })
// })



elements.forEach(element => {
    element.addEventListener("click", (e) => {
        // Solo activar si el clic fue exactamente en el <a> (o dentro de él)
        console.log("eaeae")
        console.log(Array.from(element.querySelectorAll("li.SD")))
        const link = element.querySelector("a")
        console.log(link)
        if (link && link.contains(e.target)) {
            // Cerrar los demás
            elements.forEach(el => {
                if (el !== element) {
                    sub_menus.forEach(submenu=>{
                        submenu.classList.remove("open")
                    })
                    el.classList.remove("open")
                    console.log("aqui borramos open de todos")
                    
                }
            })

            // Alternar la clase solo en este
            element.classList.toggle("open")
        }
    })
})


sub_menus.forEach(element=>{
    element.addEventListener("click", (e)=>{
        let link = element.querySelector("a")
        if(link && link.contains(e.target)){
            sub_menus.forEach(el=>{
                if(el !== element){
                    el.classList.remove("open")
                }
            })
            element.classList.toggle("open")
        }
    })
})


