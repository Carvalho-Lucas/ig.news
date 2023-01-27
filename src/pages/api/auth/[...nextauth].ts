import { query as q } from "faunadb"
import NextAuth from "next-auth"
import Provider from "next-auth/providers/github"
import { fauna } from "../../../services/fauna"

export const authOptions = {
  providers: [
    Provider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          scope: 'read-user',
        },
      },
    }),
  ],
  session:{
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
    signinKey: process.env.JWT_SIGNING_PRIVATE_KEY,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const { email } = user;
      try {
        await fauna.query(
          q.Create(
            q.Collection('users'),
            {
              data: {
                email: email,
              },
            },
          )
        )
        return true
      } catch {
        return false
      }
    },
  },
}
export default NextAuth(authOptions)