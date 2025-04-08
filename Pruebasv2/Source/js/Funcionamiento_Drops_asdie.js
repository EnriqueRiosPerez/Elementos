let ul_drop = document.querySelector(".Aside_Nav")
let elements = Array.from(ul_drop.querySelectorAll("li.F"))
let boton_aside = document.getElementById("boton_aside")
console.log(ul_drop)
console.log(elements)
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
        const link = element.querySelector("a")
        if (link && link.contains(e.target)) {
            // Cerrar los demás
            elements.forEach(el => {
                if (el !== element) {
                    el.classList.remove("open")
                }
            })

            // Alternar la clase solo en este
            element.classList.toggle("open")
        }
    })
})