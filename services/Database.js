const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { check, validationResult } = require('express-validator')

class Database {
  register() {
    // 
    prisma.$connect()

    // 
    const resapi = this.app.container.make('Provider/RestApi')
    resapi.registerRouteCallback(function (app) {
      // get all content
      app.get('/content', async (req, res) => {
        // get all content with relation with ContentMeta
        const content = await prisma.content.findMany({
          include: {
            Meta: true
          }
        })
        res.json(content)
      })
      // find content by id
      app.get('/content/:id', async (req, res) => {
        const content = await prisma.content.findFirst({
          where: {
            id: parseInt(req.params.id)
          },
          include: {
            Meta: true
          }
        })
        res.json(content)
      })
      // create content
      app.post(
        '/content',
        [
          check('key').not().isEmpty(),
          check('value').not().isEmpty(),
        ],
        async (req, res) => {
          if (errors = validationResult(req).array()) res.json(errors)
          const content = await prisma.content.create({
            data: {

            }
          })
          res.json(content)
        }
      )
    })
  }
  boot() {
  }
  startup() {
  }
}

module.exports = Database;