let livros = [];
        let paginaAtual = 0;
        const limite = 10;
        const resultadosDiv = document.getElementById('resultados');
        const favoritosDiv = document.getElementById('favoritos');
        const favoritosSection = document.getElementById('favoritosSection');

        
        let favoritos = JSON.parse(localStorage.getItem('favoritos')) || [];

        function salvarFavoritos() {
            localStorage.setItem('favoritos', JSON.stringify(favoritos));
            exibirFavoritos();
        }

        function exibirFavoritos() {
            favoritosDiv.innerHTML = ''; 
            if (favoritos.length) {
                favoritos.forEach(titulo => {
                    const livro = livros.find(livro => livro.volumeInfo.title === titulo); 
                    const link = livro ? livro.volumeInfo.infoLink : '#';

                    const itemDiv = document.createElement('div');
                    itemDiv.innerHTML = `<a href="${link}" target="_blank">${titulo}</a>`; 
                    favoritosDiv.appendChild(itemDiv);
                });
                favoritosSection.style.display = 'block'; 
            } else {
                favoritosSection.style.display = 'none'; 
            }
        }

        async function buscarLivros(query, novaBusca = false) {
            const resposta = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&startIndex=${paginaAtual * limite}&maxResults=${limite}`);
            const dados = await resposta.json();

            if (novaBusca) {
                livros = dados.items || [];
                paginaAtual = 0; 
            } else {
                livros = [...livros, ...(dados.items || [])];
            }

            exibirResultados(livros);
            paginaAtual++;
        }

        function exibirResultados(livrosParaExibir) {
            resultadosDiv.innerHTML = ''; 

            if (livrosParaExibir.length) {
                livrosParaExibir.map(livro => {
                    const titulo = livro.volumeInfo.title || 'Sem título';
                    const autor = livro.volumeInfo.authors ? livro.volumeInfo.authors.join(', ') : 'Autor desconhecido';
                    const editora = livro.volumeInfo.publisher || 'Editora desconhecida'; 
                    const imagem = livro.volumeInfo.imageLinks ? livro.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/128x200?text=Sem+imagem'; 
                    const link = livro.volumeInfo.infoLink; 

                    const itemDiv = document.createElement('div');
                    itemDiv.innerHTML = `
                        <h3><a href="${link}" target="_blank">${titulo}</a></h3> <!-- Link para abrir o livro -->
                        <p>Autor: ${autor}</p>
                        <p>Editora: ${editora}</p> <!-- Exibe a editora -->
                        <img src="${imagem}" alt="Capa do livro '${titulo}'" />
                        <span class="favorito" data-titulo="${titulo}" style="color: ${favoritos.includes(titulo) ? 'red' : 'black'}; cursor: pointer;">${favoritos.includes(titulo) ? ' Remover Favorito' : 'Favoritar'}</span>
                    `;
                    resultadosDiv.appendChild(itemDiv);
                });
            } else {
                resultadosDiv.innerHTML = '<p>Nenhum livro encontrado.</p>';
            }

           
            document.querySelectorAll('.favorito').forEach(botao => {
                botao.addEventListener('click', (e) => {
                    const titulo = e.target.dataset.titulo;
                    const isFavorito = favoritos.includes(titulo);
                    
                    if (!isFavorito) {
                        favoritos.push(titulo); 
                    } else {
                        favoritos = favoritos.filter(fav => fav !== titulo); 
                    }

                    salvarFavoritos();
                    exibirResultados(livros); 
                });
            });
        }

        function buscarLivrosPorInput() {
            const query = document.getElementById('filtro').value;
            buscarLivros(query, true);
        }

        document.getElementById('buscarBtn').addEventListener('click', buscarLivrosPorInput);

        
        document.getElementById('filtro').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                buscarLivrosPorInput(); 
            }
        });

        document.getElementById('limparBtn').addEventListener('click', () => {
            document.getElementById('filtro').value = ''; 
            resultadosDiv.innerHTML = ''; 
            paginaAtual = 0; 
        });

        document.getElementById('limparFavoritosBtn').addEventListener('click', () => {
            favoritos = []; 
            salvarFavoritos(); 
        });

        window.addEventListener('scroll', () => {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
                const query = document.getElementById('filtro').value;
                document.getElementById('carregando').style.display = 'block';
                buscarLivros(query);
            }
        });

        
        window.onload = () => {
            buscarLivros(''); 
            exibirFavoritos(); 
        };