# Styleguide options
### Head
    <meta name='viewport' content='width=device-width, initial-scale=1' />
    <script src='https://cdn.rawgit.com/styledown/styledown/v1.0.2/data/styledown.js'></script>
    <link rel='stylesheet' href='https://cdn.rawgit.com/styledown/styledown/v1.0.2/data/styledown.css' />
    <link rel='stylesheet' href='../css/styleguide.css' />
    <link rel='stylesheet' href='../css/styles.css' />

### Body
    .jumbotron.jumbotron-styleguide
        .sg-container
            .jumbotron-inner
                h1 Styleguide
                p
                    | Styleguide short description. It's buildt with
                    a(href="#element") Elements
                    | ,
                    a(href="#layout") Layout
                    | &nbsp; and
                    a(href="#component") Components
                p
                    a.btn-primary(href="") Visit live site
    .sg-container(lang="en")
        div(sg-content)
    script(src="//code.jquery.com/jquery-1.11.3.min.js")
    script(src="../js/script.js")
