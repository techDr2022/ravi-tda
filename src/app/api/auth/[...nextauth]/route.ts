import NextAuth, { AuthOptions, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { JWT } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { authenticateUser } from '@/lib/auth';
import { StaffRole } from '@prisma/client';

// ============================================================================
// TYPE DECLARATIONS
// ============================================================================

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      // Clinic context
      clinicId?: string;
      clinicSlug?: string;
      clinicName?: string;
      staffId?: string;
      role?: StaffRole;
    };
  }
  
  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    // Clinic context
    clinicId?: string;
    clinicSlug?: string;
    clinicName?: string;
    staffId?: string;
    role?: StaffRole;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the primary clinic membership for a user
 */
async function getUserClinicContext(userId: string) {
  const staffMembership = await prisma.clinicStaff.findFirst({
    where: {
      userId,
      isActive: true,
      clinic: { isActive: true },
    },
    include: {
      clinic: {
        select: {
          id: true,
          slug: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  if (!staffMembership) {
    return null;
  }
  
  return {
    clinicId: staffMembership.clinic.id,
    clinicSlug: staffMembership.clinic.slug,
    clinicName: staffMembership.clinic.name,
    staffId: staffMembership.id,
    role: staffMembership.role,
  };
}

// ============================================================================
// NEXTAUTH CONFIGURATION
// ============================================================================

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const user = await authenticateUser(credentials.email, credentials.password);

        if (!user) {
          throw new Error('Invalid email or password');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
    newUser: '/setup',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },
    
    async redirect({ url, baseUrl }) {
      // Check if user needs onboarding
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/dashboard`;
    },
    
    async jwt({ token, user, account, trigger, session }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        
        // Load clinic context on initial sign in
        const clinicContext = await getUserClinicContext(user.id);
        if (clinicContext) {
          token.clinicId = clinicContext.clinicId;
          token.clinicSlug = clinicContext.clinicSlug;
          token.clinicName = clinicContext.clinicName;
          token.staffId = clinicContext.staffId;
          token.role = clinicContext.role;
        }
      }
      
      // Handle session update (e.g., when switching clinics)
      if (trigger === 'update' && session) {
        if (session.clinicId) {
          const clinicContext = await getUserClinicContext(token.id);
          if (clinicContext && clinicContext.clinicId === session.clinicId) {
            token.clinicId = clinicContext.clinicId;
            token.clinicSlug = clinicContext.clinicSlug;
            token.clinicName = clinicContext.clinicName;
            token.staffId = clinicContext.staffId;
            token.role = clinicContext.role;
          }
        }
      }
      
      return token;
    },
    
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        
        // Include clinic context in session
        if (token.clinicId) {
          session.user.clinicId = token.clinicId;
          session.user.clinicSlug = token.clinicSlug;
          session.user.clinicName = token.clinicName;
          session.user.staffId = token.staffId;
          session.user.role = token.role;
        }
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
