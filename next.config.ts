import type { NextConfig } from 'next';
import { varlockNextConfigPlugin } from '@varlock/nextjs-integration/plugin';

const nextConfig: NextConfig = {
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**.nps.gov',
			},
		],
	},
};

export default varlockNextConfigPlugin()(nextConfig);
